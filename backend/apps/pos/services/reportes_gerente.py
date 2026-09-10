from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Sum
from django.db.models.functions import Coalesce, TruncDate, TruncHour, TruncWeek
from django.utils import timezone

from apps.usuarios.models import SucursalExistente

from ..models import TurnoCaja, Venta, VentaDetalle

DINERO = DecimalField(max_digits=12, decimal_places=2)
TOTAL_LINEA = ExpressionWrapper(
    F("cantidad") * F("precio_unitario_historico"),
    output_field=DINERO,
)

TOP_VALIDOS = (5, 10, 20)
GRANULARIDADES = ("hora", "dia", "semana")


def _sucursal_id(usuario):
    """Sucursal del usuario; el admin sin sucursal ve Cuenca Centro (o la 1.ª activa)."""
    if getattr(usuario, "sucursal_id", None):
        return usuario.sucursal_id
    cuenca = SucursalExistente.objects.filter(nombre__iexact="Cuenca Centro").first()
    if cuenca:
        return cuenca.pk
    otra = (
        SucursalExistente.objects.filter(estado_activa=True)
        .order_by("id_sucursal")
        .first()
    )
    return otra.pk if otra else None


def _sucursal_nombre(usuario):
    if getattr(usuario, "sucursal_id", None):
        return getattr(usuario.sucursal, "nombre", "") or ""
    sid = _sucursal_id(usuario)
    if not sid:
        return ""
    fila = SucursalExistente.objects.filter(pk=sid).first()
    return fila.nombre if fila else ""


def rango_dia_local(dia=None):
    """Inicio/fin del día en la zona local (multi-tenant por calendario Ecuador)."""
    dia = dia or timezone.localdate()
    inicio = timezone.make_aware(datetime.combine(dia, datetime.min.time()))
    return inicio, inicio + timedelta(days=1)


def top_n(valor, defecto=5):
    try:
        n = int(valor)
    except (TypeError, ValueError):
        return defecto
    if n in TOP_VALIDOS:
        return n
    if n < 5:
        return 5
    if n <= 10:
        return 10
    return 20


def granularidad_ok(valor, defecto="hora"):
    clave = str(valor or defecto).strip().lower()
    return clave if clave in GRANULARIDADES else defecto


def turnos_sucursal(usuario):
    return TurnoCaja.objects.select_related(
        "terminal",
        "terminal__sucursal",
        "usuario",
    ).filter(terminal__sucursal_id=_sucursal_id(usuario))


def ventas_sucursal(usuario):
    return Venta.objects.filter(
        turno__terminal__sucursal_id=_sucursal_id(usuario),
        anulada=False,
    )


def marcar_auditado(usuario, turno_id):
    turno = turnos_sucursal(usuario).filter(pk=turno_id).first()
    if turno is None:
        return None
    turno.auditado = True
    turno.save(update_fields=["auditado"])
    return turno


def cierre_diario(usuario):
    inicio, fin = rango_dia_local()
    totales = ventas_sucursal(usuario).filter(
        fecha_hora__gte=inicio,
        fecha_hora__lt=fin,
    ).aggregate(
        subtotal_iva_0=Coalesce(Sum("subtotal_iva_0"), Decimal("0")),
        subtotal_iva_15=Coalesce(Sum("subtotal_iva_15"), Decimal("0")),
        monto_iva=Coalesce(Sum("monto_iva"), Decimal("0")),
        total=Coalesce(Sum("total_factura"), Decimal("0")),
        tickets=Count("id_venta"),
    )
    totales["sucursal"] = _sucursal_nombre(usuario)
    totales["fecha"] = timezone.localdate().isoformat()
    return totales


def _ventana(granularidad):
    """Rango de ventas según agrupación pedida."""
    hoy = timezone.localdate()
    _, fin = rango_dia_local(hoy)
    zona = timezone.get_current_timezone()
    if granularidad == "dia":
        inicio = timezone.make_aware(
            datetime.combine(hoy - timedelta(days=13), datetime.min.time())
        )
        return inicio, fin, TruncDate("fecha_hora", tzinfo=zona)
    if granularidad == "semana":
        inicio = timezone.make_aware(
            datetime.combine(hoy - timedelta(weeks=11), datetime.min.time())
        )
        return inicio, fin, TruncWeek("fecha_hora", tzinfo=zona)
    inicio, _ = rango_dia_local(hoy)
    return inicio, fin, TruncHour("fecha_hora", tzinfo=zona)


def _etiqueta_periodo(bucket, granularidad):
    if not bucket:
        return "—"
    if hasattr(bucket, "utcoffset"):
        local = timezone.localtime(bucket) if timezone.is_aware(bucket) else bucket
    else:
        # TruncDate devuelve date
        local = bucket
    if granularidad == "hora":
        return local.strftime("%H:00")
    if granularidad == "dia":
        return local.strftime("%d/%m")
    return f"Sem {local.strftime('%d/%m')}"


def dashboard_sucursal(usuario, top=5, granularidad="hora"):
    tope = top_n(top)
    grano = granularidad_ok(granularidad)
    inicio, fin, trunc = _ventana(grano)
    ventas = ventas_sucursal(usuario).filter(fecha_hora__gte=inicio, fecha_hora__lt=fin)

    por_tiempo = (
        ventas.annotate(bucket=trunc)
        .values("bucket")
        .annotate(total=Coalesce(Sum("total_factura"), Decimal("0")))
        .order_by("bucket")
    )
    top_qs = (
        VentaDetalle.objects.filter(venta__in=ventas)
        .values(nombre=F("producto__nombre"))
        .annotate(
            unidades=Coalesce(Sum("cantidad"), 0),
            total=Coalesce(Sum(TOTAL_LINEA), Decimal("0")),
        )
        .order_by("-unidades")[:tope]
    )
    por_cajero = (
        ventas.values(
            cajero=F("turno__usuario__nombre"),
            apellido=F("turno__usuario__apellido"),
        )
        .annotate(
            tickets=Count("id_venta"),
            total=Coalesce(Sum("total_factura"), Decimal("0")),
        )
        .order_by("-total")
    )
    serie = [
        {
            "etiqueta": _etiqueta_periodo(fila["bucket"], grano),
            "hora": _etiqueta_periodo(fila["bucket"], grano),
            "total": max(fila["total"] or Decimal("0"), Decimal("0")),
        }
        for fila in por_tiempo
    ]
    return {
        "sucursal": _sucursal_nombre(usuario),
        "fecha": timezone.localdate().isoformat(),
        "top_n": tope,
        "granularidad": grano,
        "ventas_por_hora": serie,
        "ventas_tiempo": serie,
        "top_productos": [
            {
                "nombre": fila["nombre"],
                "unidades": max(int(fila["unidades"] or 0), 0),
                "total": max(fila["total"] or Decimal("0"), Decimal("0")),
            }
            for fila in top_qs
        ],
        "ventas_por_cajero": [
            {
                "cajero": f"{f['cajero']} {f['apellido']}".strip(),
                "tickets": max(int(f["tickets"] or 0), 0),
                "total": max(f["total"] or Decimal("0"), Decimal("0")),
            }
            for f in por_cajero
        ],
    }
