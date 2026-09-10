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


class Provincia(models.Model):
    """Provincia (o distrito especial) vinculada a una zona SENPLADES."""

    id_nombre = models.CharField(max_length=64, primary_key=True)
    nombre = models.CharField(max_length=120)
    zona = models.ForeignKey(
        ZonaPlanificacion,
        on_delete=models.PROTECT,
        related_name="provincias",
    )

    class Meta:
        verbose_name = "Provincia"
        verbose_name_plural = "Provincias"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Canton(models.Model):
    id_nombre = models.CharField(max_length=64, primary_key=True)
    nombre = models.CharField(max_length=120)
    provincia = models.ForeignKey(
        Provincia,
        on_delete=models.PROTECT,
        related_name="cantones",
    )

    class Meta:
        verbose_name = "Cantón"
        verbose_name_plural = "Cantones"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Sucursal(models.Model):
    id_nombre = models.CharField(max_length=64, primary_key=True)
    nombre = models.CharField(max_length=120)
    canton = models.ForeignKey(
        Canton,
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
