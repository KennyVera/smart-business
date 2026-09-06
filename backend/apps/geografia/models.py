from django.db import models


class ZonaPlanificacion(models.Model):
    id_nombre = models.CharField(max_length=64, primary_key=True)
    nombre = models.CharField(max_length=120)
    codigo = models.PositiveSmallIntegerField(unique=True)
    descripcion = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "Zona de planificación"
        verbose_name_plural = "Zonas de planificación"
        ordering = ["codigo"]

    def __str__(self):
        return self.nombre


class Subzona(models.Model):
    id_nombre = models.CharField(max_length=64, primary_key=True)
    nombre = models.CharField(max_length=120)
    zona = models.ForeignKey(
        ZonaPlanificacion,
        on_delete=models.PROTECT,
        related_name="subzonas",
    )

    class Meta:
        verbose_name = "Subzona"
        verbose_name_plural = "Subzonas"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class CantonDistrito(models.Model):
    id_nombre = models.CharField(max_length=64, primary_key=True)
    nombre = models.CharField(max_length=120)
    subzona = models.ForeignKey(
        Subzona,
        on_delete=models.PROTECT,
        related_name="cantones",
    )

    class Meta:
        verbose_name = "Cantón / Distrito"
        verbose_name_plural = "Cantones / Distritos"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Sucursal(models.Model):
    id_nombre = models.CharField(max_length=64, primary_key=True)
    nombre = models.CharField(max_length=120)
    canton = models.ForeignKey(
        CantonDistrito,
        on_delete=models.PROTECT,
        related_name="sucursales",
    )
    direccion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=32, blank=True)
    activa = models.BooleanField(default=True)
    fecha_apertura = models.DateField(null=True, blank=True)
    fecha_cierre = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Sucursal"
        verbose_name_plural = "Sucursales"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre
