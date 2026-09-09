from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Sum
from django.db.models.functions import Coalesce, TruncHour
from django.utils import timezone

from ..models import TurnoCaja, Venta, VentaDetalle

DINERO = DecimalField(max_digits=12, decimal_places=2)
TOTAL_LINEA = ExpressionWrapper(
    F("cantidad") * F("precio_unitario_historico"),
    output_field=DINERO,
)


def _sucursal_id(usuario):
    return usuario.sucursal_id


def rango_dia_local(dia=None):
    """Inicio/fin del día en la zona local (multi-tenant por calendario Ecuador)."""
    dia = dia or timezone.localdate()
    inicio = timezone.make_aware(datetime.combine(dia, datetime.min.time()))
    return inicio, inicio + timedelta(days=1)


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
    totales["sucursal"] = getattr(usuario.sucursal, "nombre", "")
    totales["fecha"] = timezone.localdate().isoformat()
    return totales


def dashboard_sucursal(usuario):
    inicio, fin = rango_dia_local()
    ventas = ventas_sucursal(usuario).filter(fecha_hora__gte=inicio, fecha_hora__lt=fin)
    por_hora = (
        ventas.annotate(hora=TruncHour("fecha_hora"))
        .values("hora")
        .annotate(total=Coalesce(Sum("total_factura"), Decimal("0")))
        .order_by("hora")
    )
    top = (
        VentaDetalle.objects.filter(venta__in=ventas)
        .values(nombre=F("producto__nombre"))
        .annotate(
            unidades=Coalesce(Sum("cantidad"), 0),
            total=Coalesce(Sum(TOTAL_LINEA), Decimal("0")),
        )
        .order_by("-unidades")[:5]
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
    return {
        "sucursal": getattr(usuario.sucursal, "nombre", ""),
        "fecha": timezone.localdate().isoformat(),
        "ventas_por_hora": [
            {
                "hora": fila["hora"].strftime("%H:00") if fila["hora"] else "",
                "total": fila["total"],
            }
            for fila in por_hora
        ],
        "top_productos": list(top),
        "ventas_por_cajero": [
            {
                "cajero": f"{f['cajero']} {f['apellido']}".strip(),
                "tickets": f["tickets"],
                "total": f["total"],
            }
            for f in por_cajero
        ],
    }
