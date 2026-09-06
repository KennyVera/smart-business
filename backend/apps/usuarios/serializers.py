from rest_framework import serializers

from .models import Rol, SucursalExistente


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ("id_rol", "nombre", "descripcion")


class SucursalAsignableSerializer(serializers.ModelSerializer):
    class Meta:
        model = SucursalExistente
        fields = ("id_sucursal", "nombre")


class LoginSerializer(serializers.Serializer):
    usuario = serializers.CharField()
    clave = serializers.CharField()
