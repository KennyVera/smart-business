from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from ..models import InventarioStock, LoteCaducidad


def fila_stock(sucursal_id, producto_id):
    return InventarioStock.objects.filter(
        sucursal_id=sucursal_id,
        producto_id=producto_id,
    )


@transaction.atomic
def ajustar_stock(sucursal_id, producto, cantidad_actual, stock_minimo):
    fila = fila_stock(sucursal_id, producto.pk)
    if fila.exists():
        fila.update(cantidad_actual=cantidad_actual, stock_minimo=stock_minimo)
    else:
        InventarioStock.objects.create(
            sucursal_id=sucursal_id,
            producto=producto,
            cantidad_actual=cantidad_actual,
            stock_minimo=stock_minimo,
        )
    return fila.select_related("producto", "sucursal", "producto__categoria").first()


@transaction.atomic
def sumar_stock(sucursal_id, producto, cantidad):
    fila = fila_stock(sucursal_id, producto.pk)
    if fila.exists():
        fila.update(cantidad_actual=F("cantidad_actual") + cantidad)
    else:
        InventarioStock.objects.create(
            sucursal_id=sucursal_id,
            producto=producto,
            cantidad_actual=cantidad,
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
    return serializer.save(usuario=usuario, sucursal_id=sucursal_id)
