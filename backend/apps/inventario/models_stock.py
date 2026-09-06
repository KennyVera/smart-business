from django.db import models

from apps.usuarios.models import SucursalExistente, Usuario

from .models_catalogo import Producto


class InventarioStock(models.Model):
    pk = models.CompositePrimaryKey("sucursal", "producto")
    sucursal = models.ForeignKey(
        SucursalExistente,
        db_column="id_sucursal",
        on_delete=models.PROTECT,
        related_name="stock",
    )
    producto = models.ForeignKey(
        Producto,
        db_column="id_producto",
        on_delete=models.PROTECT,
        related_name="stock",
    )
    cantidad_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=5)

    class Meta:
        db_table = "inventario_stock"
        managed = False
        verbose_name = "Stock por sucursal"
        verbose_name_plural = "Stock por sucursal"
        ordering = ["producto__nombre"]

    def __str__(self):
        return f"{self.producto_id}@{self.sucursal_id}: {self.cantidad_actual}"


class LoteCaducidad(models.Model):
    id_lote = models.AutoField(primary_key=True)
    sucursal = models.ForeignKey(
        SucursalExistente,
        db_column="id_sucursal",
        on_delete=models.PROTECT,
        related_name="lotes",
    )
    producto = models.ForeignKey(
        Producto,
        db_column="id_producto",
        on_delete=models.PROTECT,
        related_name="lotes",
    )
    codigo_lote = models.CharField(max_length=50)
    fecha_vencimiento = models.DateField()
    cantidad = models.IntegerField()

    class Meta:
        db_table = "lote_caducidad"
        managed = False
        verbose_name = "Lote"
        verbose_name_plural = "Lotes"
        ordering = ["fecha_vencimiento"]

    def __str__(self):
        return f"{self.codigo_lote} vence {self.fecha_vencimiento}"


class RegistroMerma(models.Model):
    id_merma = models.AutoField(primary_key=True)
    sucursal = models.ForeignKey(
        SucursalExistente,
        db_column="id_sucursal",
        on_delete=models.PROTECT,
        related_name="mermas",
    )
    producto = models.ForeignKey(
        Producto,
        db_column="id_producto",
        on_delete=models.PROTECT,
        related_name="mermas",
    )
    usuario = models.ForeignKey(
        Usuario,
        db_column="id_usuario",
        on_delete=models.PROTECT,
        related_name="mermas",
    )
    cantidad = models.IntegerField()
    motivo = models.CharField(max_length=255)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "registro_merma"
        managed = False
        verbose_name = "Merma"
        verbose_name_plural = "Mermas"
        ordering = ["-fecha"]

    def __str__(self):
        return f"{self.producto_id} x{self.cantidad}"
