from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from ..models import HistorialMovimiento, InventarioStock, LoteCaducidad
from .kardex import registrar_movimiento


def fila_stock(sucursal_id, producto_id):
    return InventarioStock.objects.filter(
        sucursal_id=sucursal_id,
        producto_id=producto_id,
    )


def cantidad_en(sucursal_id, producto_id):
    fila = fila_stock(sucursal_id, producto_id).first()
    return fila.cantidad_actual if fila else 0


@transaction.atomic
def ajustar_stock(sucursal_id, producto, cantidad_actual, stock_minimo, usuario=None):
    fila = fila_stock(sucursal_id, producto.pk)
    anterior = cantidad_en(sucursal_id, producto.pk)
    if fila.exists():
        fila.update(cantidad_actual=cantidad_actual, stock_minimo=stock_minimo)
    else:
        InventarioStock.objects.create(
            sucursal_id=sucursal_id,
            producto=producto,
            cantidad_actual=cantidad_actual,
            stock_minimo=stock_minimo,
        )
    if cantidad_actual != anterior:
        registrar_movimiento(
            sucursal_id,
            producto.pk,
            HistorialMovimiento.AJUSTE,
            cantidad_actual - anterior,
            cantidad_actual,
            usuario=usuario,
            referencia=f"Ajuste manual de {anterior} a {cantidad_actual}",
        )
    return fila.select_related("producto", "sucursal", "producto__categoria").first()


@transaction.atomic
def ingresar_lote(lote, usuario=None):
    """Suma el lote al stock y lo deja registrado en el kardex."""
    fila = fila_stock(lote.sucursal_id, lote.producto_id)
    if fila.exists():
        fila.update(cantidad_actual=F("cantidad_actual") + lote.cantidad)
    else:
        InventarioStock.objects.create(
            sucursal_id=lote.sucursal_id,
            producto=lote.producto,
            cantidad_actual=lote.cantidad,
        )
    registrar_movimiento(
        lote.sucursal_id,
        lote.producto_id,
        HistorialMovimiento.ENTRADA_LOTE,
        lote.cantidad,
        cantidad_en(lote.sucursal_id, lote.producto_id),
        usuario=usuario,
        referencia=f"Lote {lote.codigo_lote} vence {lote.fecha_vencimiento}",
    )


def descontar_lotes(sucursal_id, producto_id, cantidad):
    """Descuenta por FIFO (vence primero) para que los lotes sigan cuadrando."""
    restante = cantidad
    lotes = LoteCaducidad.objects.filter(
        sucursal_id=sucursal_id,
        producto_id=producto_id,
        cantidad__gt=0,
    ).order_by("fecha_vencimiento")
    for lote in lotes:
        if restante <= 0:
            break
        usado = min(lote.cantidad, restante)
        lote.cantidad -= usado
        lote.save(update_fields=["cantidad"])
        restante -= usado


@transaction.atomic
def registrar_merma(serializer, usuario, sucursal_id):
    producto = serializer.validated_data["producto"]
    cantidad = serializer.validated_data["cantidad"]
    fila = fila_stock(sucursal_id, producto.pk).select_for_update()
    stock = fila.first()
    if stock is None:
        raise serializers.ValidationError(
            {"producto": "Ese producto no tiene stock registrado en la sucursal."}
        )
    if stock.cantidad_actual < cantidad:
        raise serializers.ValidationError(
            {"cantidad": f"Solo hay {stock.cantidad_actual} unidades disponibles."}
        )
    fila.update(cantidad_actual=F("cantidad_actual") - cantidad)
    descontar_lotes(sucursal_id, producto.pk, cantidad)
    merma = serializer.save(usuario=usuario, sucursal_id=sucursal_id)
    registrar_movimiento(
        sucursal_id,
        producto.pk,
        HistorialMovimiento.MERMA,
        -cantidad,
        cantidad_en(sucursal_id, producto.pk),
        usuario=usuario,
        referencia=merma.motivo,
    )
    return merma
