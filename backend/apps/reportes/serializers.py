from rest_framework import serializers

from .models import HistorialReporteIA


class HistorialReporteIASerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialReporteIA
        fields = (
            "id",
            "prompt_usuario",
            "sql_generado",
            "datos_json",
            "fecha_creacion",
        )
        read_only_fields = fields


class HistorialReporteIAListSerializer(serializers.ModelSerializer):
    """Listado liviano para el panel lateral (sin payload de filas)."""

    class Meta:
        model = HistorialReporteIA
        fields = ("id", "prompt_usuario", "fecha_creacion")
        read_only_fields = fields
