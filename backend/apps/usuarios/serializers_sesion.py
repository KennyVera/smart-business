from rest_framework import serializers

from .models import SesionUsuario


class SesionUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = SesionUsuario
        fields = (
            "id_sesion",
            "fecha_inicio",
            "fecha_fin",
            "ip_address",
            "user_agent",
            "is_active",
        )
        read_only_fields = fields
