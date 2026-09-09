from django.db import models

from .models import Usuario

FILAS_VALIDAS = (10, 25, 50, 100)
COLOR_SIDEBAR_DEF = "#000000"
COLOR_GRAFICOS_DEF = "#00AA5D"
COLOR_LOGS_DEF = "#00AA5D"


class PreferenciaUsuario(models.Model):
    """Preferencias de UI individuales (no afectan a otros usuarios)."""

    id_preferencia = models.AutoField(primary_key=True)
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name="preferencias",
    )
    color_sidebar = models.CharField(max_length=20, default=COLOR_SIDEBAR_DEF)
    color_graficos = models.CharField(max_length=20, default=COLOR_GRAFICOS_DEF)
    color_logs = models.CharField(max_length=20, default=COLOR_LOGS_DEF)
    logo_personalizado = models.ImageField(
        upload_to="logos_usuarios/",
        max_length=255,
        null=True,
        blank=True,
    )
    filas_por_pagina = models.PositiveSmallIntegerField(default=10)

    class Meta:
        db_table = "preferencia_usuario"
        verbose_name = "Preferencia de usuario"
        verbose_name_plural = "Preferencias de usuario"

    def __str__(self):
        return f"prefs:{self.usuario_id}"
