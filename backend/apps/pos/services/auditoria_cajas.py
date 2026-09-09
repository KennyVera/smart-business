from datetime import date, datetime, timedelta
from decimal import Decimal

from django.db.models import F, Sum
from django.db.models.functions import Abs, Coalesce
from django.utils import timezone

from ..models import PagoVenta, Venta
from .reportes_gerente import turnos_sucursal

CERO = Decimal("0.00")


def _parse_fecha(valor):
    if not valor:
        return None
    try:
        return date.fromisoformat(str(valor)[:10])
    except ValueError:
        return None


def rango_auditoria(fecha_inicio=None, fecha_fin=None):
    """Rango inclusivo en zona local. Sin params → últimos 7 días.

    Límites: no futuro; no más de 2 años atrás; Desde ≤ Hasta.
    """
    hoy = timezone.localdate()
    try:
        minimo = hoy.replace(year=hoy.year - 2)
    except ValueError:
        minimo = hoy.replace(year=hoy.year - 2, month=2, day=28)
    fin = _parse_fecha(fecha_fin) or hoy
    inicio = _parse_fecha(fecha_inicio) or (fin - timedelta(days=6))
    fin = min(fin, hoy)
    inicio = max(inicio, minimo)
    fin = max(fin, minimo)
    if inicio > fin:
        inicio, fin = fin, inicio
    inicio = max(inicio, minimo)
    fin = min(fin, hoy)
    inicio_dt = timezone.make_aware(datetime.combine(inicio, datetime.min.time()))
    fin_dt = timezone.make_aware(
        datetime.combine(fin + timedelta(days=1), datetime.min.time())
    )
    return inicio_dt, fin_dt, inicio, fin


def auditoria_cajas(usuario, fecha_inicio=None, fecha_fin=None):
    inicio_dt, fin_dt, _, _ = rango_auditoria(fecha_inicio, fecha_fin)
    return (
        turnos_sucursal(usuario)
        .exclude(fecha_cierre=None)
        .filter(fecha_cierre__gte=inicio_dt, fecha_cierre__lt=fin_dt)
        .annotate(descuadre_abs=Abs(F("descuadre")))
        .order_by("-descuadre_abs", "-fecha_cierre")
    )


def _pagos_por_metodo(turno):
    filas = (
        PagoVenta.objects.filter(venta__turno=turno, venta__anulada=False)
        .values("metodo_pago__nombre")
        .annotate(total=Coalesce(Sum("monto"), CERO))
    )
    efectivo = CERO
    tarjeta = CERO
    transferencia = CERO
    otros = CERO
    for fila in filas:
        nombre = (fila["metodo_pago__nombre"] or "").strip().lower()
        total = fila["total"] or CERO
        if nombre == "efectivo":
            efectivo += total
        elif nombre == "tarjeta":
            tarjeta += total
        elif "transfer" in nombre:
            transferencia += total
        else:
            otros += total
    return efectivo, tarjeta, transferencia, otros


def desglose_turno(usuario, turno_id):
    turno = turnos_sucursal(usuario).filter(pk=turno_id).first()
    if turno is None:
        return None
    efectivo, tarjeta, transferencia, otros = _pagos_por_metodo(turno)
    apertura = turno.monto_apertura or CERO
    esperado = (
        turno.monto_esperado
        if turno.monto_esperado is not None
        else apertura + efectivo
    )
    tickets = list(
        Venta.objects.filter(turno=turno, anulada=False)
        .order_by("-fecha_hora", "-id_venta")[:5]
        .values("id_venta", "fecha_hora", "total_factura", "anulada")
    )
    u = turno.usuario
    return {
        "id_turno": turno.id_turno,
        "terminal_serie": turno.terminal.numero_serie,
        "cajero": f"{u.nombre} {u.apellido}".strip() or u.username,
        "fecha_apertura": turno.fecha_apertura,
        "fecha_cierre": turno.fecha_cierre,
        "auditado": turno.auditado,
        "estado": turno.estado,
        "monto_apertura": apertura,
        "ventas_efectivo": efectivo,
        "ventas_tarjeta": tarjeta,
        "ventas_transferencia": transferencia,
        "ventas_otros": otros,
        "monto_esperado": esperado,
        "monto_cierre_real": turno.monto_cierre_real,
        "descuadre": turno.descuadre,
        "tickets": tickets,
    }
