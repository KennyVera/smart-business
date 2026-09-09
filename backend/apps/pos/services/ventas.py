from decimal import ROUND_HALF_UP, Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from apps.inventario.models import HistorialMovimiento, InventarioStock
from apps.inventario.services.kardex import registrar_movimiento
from apps.inventario.services.stock import descontar_lotes

from ..impuestos import TASA_IVA
from ..models import PagoVenta, Venta, VentaDetalle

CENTAVO = Decimal("0.01")


def plata(valor):
    return valor.quantize(CENTAVO, rounding=ROUND_HALF_UP)


def es_efectivo(metodo):
    return (metodo.nombre or "").strip().lower() == "efectivo"


def stock_bloqueado(sucursal_id, producto_id):
    """Bloquea la fila hasta el commit para que dos cajas no vendan la misma unidad."""
    return (
        InventarioStock.objects.select_for_update()
        .filter(sucursal_id=sucursal_id, producto_id=producto_id)
        .first()
    )


def descontar_stock(sucursal_id, producto, cantidad, usuario, referencia):
    fila = stock_bloqueado(sucursal_id, producto.pk)
    disponible = fila.cantidad_actual if fila else 0
    if disponible < cantidad:
        raise serializers.ValidationError(
            {
                "items": [
                    f"{producto.nombre}: solo hay {disponible} "
                    f"{'unidad' if disponible == 1 else 'unidades'} en stock."
                ]
            }
        )
    InventarioStock.objects.filter(
        sucursal_id=sucursal_id,
        producto_id=producto.pk,
    ).update(cantidad_actual=F("cantidad_actual") - cantidad)
    descontar_lotes(sucursal_id, producto.pk, cantidad)
    registrar_movimiento(
        sucursal_id,
        producto.pk,
        HistorialMovimiento.VENTA_POS,
        -cantidad,
        disponible - cantidad,
        usuario=usuario,
        referencia=referencia,
    )


@transaction.atomic
def procesar_venta(turno, datos, usuario):
    """Cobra el ticket completo o no cobra nada: todo vive en una transacción.

    Cualquier ValidationError levantada aquí revierte la venta, el detalle,
    el descuento de stock, los lotes y el kardex.
    """
    if not turno.esta_abierto:
        raise serializers.ValidationError(
            {"detail": "El turno de caja está cerrado. Abre caja para vender."}
        )
    sucursal_id = turno.terminal.sucursal_id
    subtotal_iva_0 = Decimal("0.00")
    subtotal_iva_15 = Decimal("0.00")
    venta = Venta.objects.create(turno=turno, cliente=datos.get("cliente"))
    for item in datos["items"]:
        producto = item["producto"]
        cantidad = item["cantidad"]
        descontar_stock(
            sucursal_id,
            producto,
            cantidad,
            usuario,
            f"Venta #{venta.pk} en caja {turno.terminal.numero_serie}",
        )
        VentaDetalle.objects.create(
            venta=venta,
            producto=producto,
            cantidad=cantidad,
            precio_unitario_historico=producto.precio_venta,
            costo_unitario_historico=producto.costo_actual,
        )
        linea = producto.precio_venta * cantidad
        if producto.aplica_iva:
            subtotal_iva_15 += linea
        else:
            subtotal_iva_0 += linea
    subtotal_iva_0 = plata(subtotal_iva_0)
    subtotal_iva_15 = plata(subtotal_iva_15)
    monto_iva = plata(subtotal_iva_15 * TASA_IVA)
    total = plata(subtotal_iva_0 + subtotal_iva_15 + monto_iva)
    venta.subtotal_iva_0 = subtotal_iva_0
    venta.subtotal_iva_15 = subtotal_iva_15
    venta.monto_iva = monto_iva
    venta.total_factura = total
    recibido = datos.get("monto_recibido")
    if es_efectivo(datos["metodo_pago"]):
        if recibido is None:
            raise serializers.ValidationError(
                {"monto_recibido": "Indica el efectivo recibido para calcular el cambio."}
            )
        recibido = plata(recibido)
        if recibido < total:
            raise serializers.ValidationError(
                {
                    "monto_recibido": (
                        f"El efectivo recibido no cubre el total de ${total}."
                    )
                }
            )
        cambio = plata(recibido - total)
    else:
        recibido = total
        cambio = Decimal("0.00")
    venta.monto_recibido = recibido
    venta.cambio = cambio
    venta.save(
        update_fields=[
            "subtotal_iva_0",
            "subtotal_iva_15",
            "monto_iva",
            "total_factura",
            "monto_recibido",
            "cambio",
        ]
    )
    PagoVenta.objects.create(
        venta=venta,
        metodo_pago=datos["metodo_pago"],
        monto=total,
    )
    return venta, total, cambio
