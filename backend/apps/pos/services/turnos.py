from decimal import Decimal

from django.db import transaction
from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from django.utils import timezone
from rest_framework import serializers

from ..models import PagoVenta, TerminalPOS, TurnoCaja, Venta, VentaDetalle

EFECTIVO = "efectivo"
DINERO = DecimalField(max_digits=12, decimal_places=2)
TOTAL_LINEA = ExpressionWrapper(
    F("precio_unitario_historico") * F("cantidad"),
    output_field=DINERO,
)
RELACIONES = ("terminal", "terminal__sucursal", "usuario")


def turno_abierto(usuario):
    """El turno vivo del cajero; None si todavía no abrió caja."""
    return (
        TurnoCaja.objects.select_related(*RELACIONES)
        .filter(usuario=usuario, fecha_cierre__isnull=True)
        .first()
    )


def terminales_disponibles(usuario):
    consulta = TerminalPOS.objects.select_related("sucursal").filter(estado_activo=True)
    if usuario.sucursal_id:
        consulta = consulta.filter(sucursal_id=usuario.sucursal_id)
    return consulta


@transaction.atomic
def abrir_turno(usuario, terminal, monto_apertura):
    if turno_abierto(usuario) is not None:
        raise serializers.ValidationError(
            {"detail": "Ya tienes un turno de caja abierto."}
        )
    terminal = terminal or terminales_disponibles(usuario).first()
    if terminal is None:
        raise serializers.ValidationError(
            {"terminal": "No hay terminales activas en tu sucursal."}
        )
    if usuario.sucursal_id and terminal.sucursal_id != usuario.sucursal_id:
        raise serializers.ValidationError(
            {"terminal": "Esa terminal no pertenece a tu sucursal."}
        )
    if TurnoCaja.objects.filter(terminal=terminal, fecha_cierre__isnull=True).exists():
        raise serializers.ValidationError(
            {"terminal": "Esa caja ya tiene un turno abierto."}
        )
    turno = TurnoCaja.objects.create(
        terminal=terminal,
        usuario=usuario,
        monto_apertura=monto_apertura,
    )
    return TurnoCaja.objects.select_related(*RELACIONES).get(pk=turno.pk)


@transaction.atomic
def cerrar_turno(turno, monto_declarado):
    if not turno.esta_abierto:
        raise serializers.ValidationError({"detail": "Ese turno ya está cerrado."})
    turno.fecha_cierre = timezone.now()
    turno.monto_cierre_declarado = monto_declarado
    turno.save(update_fields=["fecha_cierre", "monto_cierre_declarado"])
    return turno


def resumen_turno(turno):
    """Lo que el cajero necesita ver antes de cerrar la caja."""
    vendido = VentaDetalle.objects.filter(venta__turno=turno).aggregate(
        total=Sum(TOTAL_LINEA)
    )["total"] or Decimal("0.00")
    efectivo = PagoVenta.objects.filter(
        venta__turno=turno,
        metodo_pago__nombre__iexact=EFECTIVO,
    ).aggregate(total=Sum("monto"))["total"] or Decimal("0.00")
    return {
        "ventas": Venta.objects.filter(turno=turno).count(),
        "total_vendido": round(vendido, 2),
        "total_efectivo": round(efectivo, 2),
        "efectivo_esperado": round(turno.monto_apertura + efectivo, 2),
    }
