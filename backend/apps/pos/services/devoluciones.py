from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.inventario.models import HistorialMovimiento, InventarioStock
from apps.inventario.services.kardex import registrar_movimiento
from apps.inventario.services.stock import cantidad_en

from ..models import Venta


def _misma_sucursal(venta, usuario):
    return venta.turno.terminal.sucursal_id == usuario.sucursal_id


def _devolver_linea(sucursal_id, detalle, usuario, venta_id):
    producto_id = detalle.producto_id
    cantidad = detalle.cantidad
    fila = (
        InventarioStock.objects.select_for_update()
        .filter(sucursal_id=sucursal_id, producto_id=producto_id)
        .first()
    )
    if fila:
        InventarioStock.objects.filter(
            sucursal_id=sucursal_id,
            producto_id=producto_id,
        ).update(cantidad_actual=F("cantidad_actual") + cantidad)
    else:
        InventarioStock.objects.create(
            sucursal_id=sucursal_id,
            producto_id=producto_id,
            cantidad_actual=cantidad,
        )
    registrar_movimiento(
        sucursal_id,
        producto_id,
        HistorialMovimiento.DEVOLUCION_POS,
        cantidad,
        cantidad_en(sucursal_id, producto_id),
        usuario=usuario,
        referencia=f"Anulación venta #{venta_id}",
    )


@transaction.atomic
def anular_venta(venta, usuario):
    """Devuelve stock a la sucursal de la terminal y marca la factura anulada."""
    venta = (
        Venta.objects.select_related("turno__terminal")
        .prefetch_related("detalles")
        .select_for_update()
        .get(pk=venta.pk)
    )
    if not usuario.sucursal_id or not _misma_sucursal(venta, usuario):
        raise PermissionDenied(
            "No puedes anular facturas de otra sucursal."
        )
    if venta.anulada:
        raise ValidationError({"detail": "Esa factura ya está anulada."})
    sucursal_id = venta.turno.terminal.sucursal_id
    for detalle in venta.detalles.all():
        _devolver_linea(sucursal_id, detalle, usuario, venta.pk)
    venta.anulada = True
    venta.save(update_fields=["anulada"])
    return venta
