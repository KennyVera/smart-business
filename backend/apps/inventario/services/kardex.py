from ..models import HistorialMovimiento


def registrar_movimiento(
    sucursal_id,
    producto_id,
    tipo,
    cantidad,
    stock_resultante,
    usuario=None,
    referencia="",
):
    return HistorialMovimiento.objects.create(
        sucursal_id=sucursal_id,
        producto_id=producto_id,
        usuario=usuario,
        tipo=tipo,
        cantidad=cantidad,
        stock_resultante=stock_resultante,
        referencia=referencia[:255],
    )
