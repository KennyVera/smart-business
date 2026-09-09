from rest_framework import serializers

from .models import Cliente
from .validadores import (
    CORREO_MAX,
    NOMBRE_MAX,
    limpiar_nombre,
    mensaje_correo,
    mensaje_identificacion,
    mensaje_nombre,
    solo_digitos,
)


class ClienteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.CharField(read_only=True)
    cedula = serializers.CharField(source="cedula_ruc", read_only=True)

    class Meta:
        model = Cliente
        fields = (
            "id_cliente",
            "cedula_ruc",
            "cedula",
            "nombres",
            "apellidos",
            "nombre_completo",
            "correo",
            "telefono",
            "puntos_acumulados",
        )
        extra_kwargs = {
            "cedula_ruc": {
                "required": True,
                "allow_blank": False,
                "allow_null": False,
                "validators": [],
            },
            "nombres": {"required": True, "allow_blank": False},
            "apellidos": {"required": True, "allow_blank": False},
            "correo": {"required": False, "allow_blank": True, "allow_null": True},
            "telefono": {"required": False, "allow_blank": True, "allow_null": True},
            "puntos_acumulados": {"read_only": True},
        }

    def validate_cedula_ruc(self, value):
        cedula = solo_digitos(value)
        aviso = mensaje_identificacion(cedula)
        if aviso:
            raise serializers.ValidationError(aviso)
        ya_existe = (
            Cliente.objects.filter(cedula_ruc=cedula).exists()
            or Cliente.objects.filter(cedula_ruc=cedula.zfill(10)).exists()
            or Cliente.objects.filter(cedula_ruc=cedula.zfill(13)).exists()
        )
        if ya_existe:
            raise serializers.ValidationError(
                "Ya existe un cliente con esa identificación."
            )
        return cedula

    def validate_nombres(self, value):
        nombres = limpiar_nombre(value)
        aviso = mensaje_nombre(nombres, "nombres")
        if aviso:
            raise serializers.ValidationError(aviso)
        return nombres[:NOMBRE_MAX]

    def validate_apellidos(self, value):
        apellidos = limpiar_nombre(value)
        aviso = mensaje_nombre(apellidos, "apellidos")
        if aviso:
            raise serializers.ValidationError(aviso)
        return apellidos[:NOMBRE_MAX]

    def validate_correo(self, value):
        correo = (value or "").strip()
        aviso = mensaje_correo(correo)
        if aviso:
            raise serializers.ValidationError(aviso)
        return correo[:CORREO_MAX] or None
