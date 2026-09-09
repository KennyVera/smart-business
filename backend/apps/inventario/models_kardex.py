from django.db import models

from apps.usuarios.models import SucursalExistente, Usuario

from .models_catalogo import Producto


class HistorialMovimiento(models.Model):
    """Kardex: toda entrada o salida que cambia el stock de un producto."""

    ENTRADA_LOTE = "ENTRADA_LOTE"
    VENTA_POS = "VENTA_POS"
    DEVOLUCION_POS = "DEVOLUCION_POS"
    MERMA = "MERMA"
    AJUSTE = "AJUSTE"
    TIPOS = [
        (ENTRADA_LOTE, "Entrada por lote"),
        (VENTA_POS, "Venta en POS"),
        (DEVOLUCION_POS, "Devolución / anulación POS"),
        (MERMA, "Baja por merma"),
        (AJUSTE, "Ajuste manual"),
    ]

    id_movimiento = models.AutoField(primary_key=True)
    sucursal = models.ForeignKey(
        SucursalExistente,
        db_column="id_sucursal",
        on_delete=models.PROTECT,
        related_name="movimientos",
    )
    producto = models.ForeignKey(
        Producto,
        db_column="id_producto",
        on_delete=models.PROTECT,
        related_name="movimientos",
    )
    usuario = models.ForeignKey(
        Usuario,
        db_column="id_usuario",
        on_delete=models.PROTECT,
        related_name="movimientos",
        null=True,
        blank=True,
    )
    tipo = models.CharField(max_length=20, choices=TIPOS)
    cantidad = models.IntegerField(help_text="Positivo si entra, negativo si sale.")
    stock_resultante = models.IntegerField()
    referencia = models.CharField(max_length=255, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "historial_movimiento"
        verbose_name = "Movimiento de inventario"
        verbose_name_plural = "Movimientos de inventario"
        ordering = ["-fecha", "-id_movimiento"]
        indexes = [
            models.Index(
                fields=["producto", "sucursal", "-fecha"],
                name="idx_kardex_producto",
            )
        ]

    def __str__(self):
        return f"{self.tipo} {self.cantidad} ({self.producto_id})"
