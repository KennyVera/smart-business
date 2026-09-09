from django.db import models

from apps.crm.models import Cliente
from apps.inventario.models import Producto

from .models_caja import MetodoPago, TurnoCaja

__all__ = ["Cliente", "Venta", "VentaDetalle", "PagoVenta"]


class Venta(models.Model):
    """Cabecera de la transacción; siempre cuelga de un turno de caja."""

    id_venta = models.AutoField(primary_key=True)
    turno = models.ForeignKey(
        TurnoCaja,
        db_column="id_turno",
        on_delete=models.PROTECT,
        related_name="ventas",
    )
    cliente = models.ForeignKey(
        Cliente,
        db_column="id_cliente",
        on_delete=models.PROTECT,
        related_name="ventas",
        null=True,
        blank=True,
    )
    fecha_hora = models.DateTimeField(auto_now_add=True)
    subtotal_iva_0 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal_iva_15 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_iva = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_factura = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_recibido = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cambio = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    anulada = models.BooleanField(default=False)

    class Meta:
        db_table = "venta"
        managed = False
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ["-fecha_hora", "-id_venta"]

    def __str__(self):
        return f"Venta {self.id_venta}"


class VentaDetalle(models.Model):
    """Línea de la venta con precio y costo congelados al momento del cobro."""

    pk = models.CompositePrimaryKey("venta", "producto")
    venta = models.ForeignKey(
        Venta,
        db_column="id_venta",
        on_delete=models.CASCADE,
        related_name="detalles",
    )
    producto = models.ForeignKey(
        Producto,
        db_column="id_producto",
        on_delete=models.PROTECT,
        related_name="ventas",
    )
    cantidad = models.IntegerField()
    precio_unitario_historico = models.DecimalField(max_digits=10, decimal_places=2)
    costo_unitario_historico = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "venta_detalle"
        managed = False
        verbose_name = "Detalle de venta"
        verbose_name_plural = "Detalles de venta"
        ordering = ["producto__nombre"]

    def __str__(self):
        return f"{self.producto_id} x{self.cantidad}"

    @property
    def total_linea(self):
        return self.precio_unitario_historico * self.cantidad


class PagoVenta(models.Model):
    """Cuánto se cobró con cada método de pago en una venta."""

    pk = models.CompositePrimaryKey("venta", "metodo_pago")
    venta = models.ForeignKey(
        Venta,
        db_column="id_venta",
        on_delete=models.CASCADE,
        related_name="pagos",
    )
    metodo_pago = models.ForeignKey(
        MetodoPago,
        db_column="id_metodo_pago",
        on_delete=models.PROTECT,
        related_name="pagos",
    )
    monto = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "pago_venta"
        managed = False
        verbose_name = "Pago de venta"
        verbose_name_plural = "Pagos de venta"
        ordering = ["metodo_pago__nombre"]

    def __str__(self):
        return f"{self.metodo_pago_id}: {self.monto}"
