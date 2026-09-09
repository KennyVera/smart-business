from django.db import models


class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "categoria"
        managed = False
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    categoria = models.ForeignKey(
        Categoria,
        db_column="id_categoria",
        on_delete=models.PROTECT,
        related_name="productos",
    )
    sku = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=150)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    costo_actual = models.DecimalField(max_digits=10, decimal_places=2)
    imagen = models.ImageField(
        upload_to="productos/",
        max_length=255,
        blank=True,
        null=True,
    )
    aplica_iva = models.BooleanField(default=True)

    class Meta:
        db_table = "producto"
        managed = False
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ["nombre"]

    def __str__(self):
        return f"{self.sku} - {self.nombre}"
