from django.db import models


class ZonaExistente(models.Model):
    id_zona = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)

    class Meta:
        db_table = "zona_planificacion"
        managed = False


class SubzonaExistente(models.Model):
    id_subzona = models.AutoField(primary_key=True)
    zona = models.ForeignKey(
        ZonaExistente,
        db_column="id_zona",
        on_delete=models.PROTECT,
    )
    nombre = models.CharField(max_length=150)

    class Meta:
        db_table = "subzona"
        managed = False


class CantonExistente(models.Model):
    id_canton = models.AutoField(primary_key=True)
    subzona = models.ForeignKey(
        SubzonaExistente,
        db_column="id_subzona",
        on_delete=models.PROTECT,
    )
    nombre = models.CharField(max_length=150)

    class Meta:
        db_table = "canton_distrito"
        managed = False
