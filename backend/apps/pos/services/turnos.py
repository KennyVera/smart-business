from decimal import ROUND_HALF_UP, Decimal

from django.db import transaction
from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from django.utils import timezone
from rest_framework import serializers

from ..models import PagoVenta, TerminalPOS, TurnoCaja, Venta, VentaDetalle

EFECTIVO = "efectivo"
CENTAVO = Decimal("0.01")
DINERO = DecimalField(max_digits=12, decimal_places=2)
TOTAL_LINEA = ExpressionWrapper(
    F("precio_unitario_historico") * F("cantidad"),
    output_field=DINERO,
)
RELACIONES = ("terminal", "terminal__sucursal", "usuario")


def plata(valor):
    return Decimal(valor).quantize(CENTAVO, rounding=ROUND_HALF_UP)


def turno_abierto(usuario):
    """El turno vivo del cajero; None si todavía no abrió caja."""
    return (
        TurnoCaja.objects.select_related(*RELACIONES)
        .filter(
            usuario=usuario,
            fecha_cierre__isnull=True,
            estado=TurnoCaja.ABIERTO,
        )
        .first()
    )


def terminales_disponibles(usuario):
    consulta = TerminalPOS.objects.select_related("sucursal").filter(estado_activo=True)
    if usuario.sucursal_id:
        consulta = consulta.filter(sucursal_id=usuario.sucursal_id)
    return consulta


def ventas_efectivo(turno):
    return PagoVenta.objects.filter(
        venta__turno=turno,
        metodo_pago__nombre__iexact=EFECTIVO,
    ).aggregate(total=Sum("monto"))["total"] or Decimal("0.00")


def calcular_monto_esperado(turno):
    """Apertura + ventas cobradas en efectivo."""
    return plata(turno.monto_apertura + ventas_efectivo(turno))


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
    if TurnoCaja.objects.filter(
        terminal=terminal,
        fecha_cierre__isnull=True,
        estado=TurnoCaja.ABIERTO,
    ).exists():
        raise serializers.ValidationError(
            {"terminal": "Esa caja ya tiene un turno abierto."}
        )
    turno = TurnoCaja.objects.create(
        terminal=terminal,
        usuario=usuario,
        monto_apertura=monto_apertura,
        monto_esperado=monto_apertura,
        estado=TurnoCaja.ABIERTO,
    )
    return TurnoCaja.objects.select_related(*RELACIONES).get(pk=turno.pk)


@transaction.atomic
def cerrar_turno(turno, monto_cierre_real):
    if not turno.esta_abierto:
        raise serializers.ValidationError({"detail": "Ese turno ya está cerrado."})
    esperado = calcular_monto_esperado(turno)
    real = plata(monto_cierre_real)
    turno.monto_esperado = esperado
    turno.monto_cierre_real = real
    turno.monto_cierre_declarado = real
    turno.descuadre = plata(real - esperado)
    turno.fecha_cierre = timezone.now()
    turno.estado = TurnoCaja.CERRADO
    turno.save(
        update_fields=[
            "monto_esperado",
            "monto_cierre_real",
            "monto_cierre_declarado",
            "descuadre",
            "fecha_cierre",
            "estado",
        ]
    )
    return turno


def resumen_turno(turno):
    """Lo que el cajero necesita ver antes de cerrar la caja."""
    vendido = VentaDetalle.objects.filter(venta__turno=turno).aggregate(
        total=Sum(TOTAL_LINEA)
    )["total"] or Decimal("0.00")
    efectivo = ventas_efectivo(turno)
    esperado = calcular_monto_esperado(turno)
    return {
        "ventas": Venta.objects.filter(turno=turno).count(),
        "total_vendido": plata(vendido),
        "total_efectivo": plata(efectivo),
        "efectivo_esperado": esperado,
        "monto_esperado": esperado,
    }
