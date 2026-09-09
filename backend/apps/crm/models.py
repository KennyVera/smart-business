from django.db import models

from core.validators_negocio import (
    CEDULA_O_RUC,
    NOMBRE_PERSONA,
    NO_NEGATIVO_INT,
    TELEFONO_MOVIL,
)


class Cliente(models.Model):
    """Afiliado del CRM: cédula/RUC para facturación electrónica."""

    id_cliente = models.AutoField(primary_key=True)
    cedula_ruc = models.CharField(
        max_length=13,
        unique=True,
        db_column="cedula",
        null=True,
        blank=True,
        validators=[CEDULA_O_RUC],
    )
    nombres = models.CharField(
        max_length=100,
        validators=[NOMBRE_PERSONA],
    )
    apellidos = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )
    correo = models.CharField(
        max_length=100,
        db_column="email",
        null=True,
        blank=True,
    )
    telefono = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        validators=[TELEFONO_MOVIL],
    )
    puntos_acumulados = models.IntegerField(
        default=0,
        validators=[NO_NEGATIVO_INT],
    )
    fecha_nacimiento = models.DateField(null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cliente"
        managed = False
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ["apellidos", "nombres"]

    def __str__(self):
        return f"{self.nombres} {self.apellidos}".strip()

    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}".strip()

    @property
    def cedula(self):
        return self.cedula_ruc
