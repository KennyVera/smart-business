from django.db import models

from apps.usuarios.models import Usuario


class HistorialReporteIA(models.Model):
    """Snapshot de un reporte Text-to-SQL para reconsultar sin llamar a Gemini."""

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column="id_usuario",
        related_name="reportes_ia",
    )
    prompt_usuario = models.TextField()
    sql_generado = models.TextField()
    datos_json = models.JSONField(
        help_text="Snapshot: {columnas: [...], datos: [...]}",
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "historial_reporte_ia"
        ordering = ["-fecha_creacion"]
        verbose_name = "Historial reporte IA"
        verbose_name_plural = "Historial reportes IA"

    def __str__(self):
        return f"{self.usuario_id}: {self.prompt_usuario[:60]}"
