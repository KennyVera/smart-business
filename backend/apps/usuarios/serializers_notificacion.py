from rest_framework import serializers

from core.fechas import con_zona

from .models import Notificacion


class NotificacionSerializer(serializers.ModelSerializer):
    fecha_creacion = serializers.SerializerMethodField()

    class Meta:
        model = Notificacion
        fields = (
            "id_notificacion",
            "titulo",
            "mensaje",
            "tipo",
            "leida",
            "fecha_creacion",
        )
        read_only_fields = fields

    def get_fecha_creacion(self, obj):
        return con_zona(obj.fecha_creacion)
