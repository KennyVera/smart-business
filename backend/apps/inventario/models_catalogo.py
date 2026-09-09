from django.db import models

from core.validators_negocio import (
    NO_NEGATIVO,
    NOMBRE_PERSONA,
    RUC_EMPRESA,
    TELEFONO_MOVIL,
)


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


class Proveedor(models.Model):
    """Proveedor del catálogo (bodega / compras)."""

    id_proveedor = models.AutoField(primary_key=True)
    ruc = models.CharField(max_length=13, unique=True, validators=[RUC_EMPRESA])
    razon_social = models.CharField(max_length=150)
    nombre_contacto = models.CharField(max_length=100, validators=[NOMBRE_PERSONA])
    telefono = models.CharField(max_length=10, validators=[TELEFONO_MOVIL])
    email = models.EmailField(max_length=100)
    direccion = models.TextField()

    class Meta:
        db_table = "proveedor"
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ["razon_social"]

    def __str__(self):
        return self.razon_social


class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    categoria = models.ForeignKey(
        Categoria,
        db_column="id_categoria",
        on_delete=models.PROTECT,
        related_name="productos",
    )
    proveedor = models.ForeignKey(
        Proveedor,
        db_column="id_proveedor",
        on_delete=models.SET_NULL,
        related_name="productos",
        null=True,
        blank=True,
    )
    sku = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=150)
    precio_venta = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[NO_NEGATIVO],
    )
    costo_actual = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[NO_NEGATIVO],
    )
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
