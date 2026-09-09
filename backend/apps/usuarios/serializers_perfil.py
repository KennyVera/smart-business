from rest_framework import serializers

from .models import Usuario
from .validadores import exigir_clave, exigir_nombre

EMAIL_MAX = 100
FOTO_MAX_MB = 2


class PerfilSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source="rol.nombre", read_only=True)
    sucursal_nombre = serializers.CharField(
        source="sucursal.nombre",
        read_only=True,
        default="",
    )
    nombre_completo = serializers.SerializerMethodField()
    correo = serializers.CharField(
        source="email",
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=EMAIL_MAX,
    )
    foto_perfil = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Usuario
        fields = (
            "id_usuario",
            "username",
            "nombre",
            "apellido",
            "correo",
            "nombre_completo",
            "foto_perfil",
            "rol",
            "rol_nombre",
            "sucursal",
            "sucursal_nombre",
        )
        read_only_fields = (
            "id_usuario",
            "username",
            "rol",
            "rol_nombre",
            "sucursal",
            "sucursal_nombre",
            "nombre_completo",
        )

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}".strip()

    def validate_nombre(self, value):
        return exigir_nombre(value, "Nombre")

    def validate_apellido(self, value):
        return exigir_nombre(value, "Apellido")

    def validate_correo(self, value):
        texto = (value or "").strip()
        if not texto:
            return None
        if "@" not in texto or "." not in texto.split("@")[-1]:
            raise serializers.ValidationError("Correo no válido.")
        if len(texto) > EMAIL_MAX:
            raise serializers.ValidationError(f"Máximo {EMAIL_MAX} caracteres.")
        return texto.lower()

    def validate_foto_perfil(self, value):
        if value is None:
            return value
        if value.size > FOTO_MAX_MB * 1024 * 1024:
            raise serializers.ValidationError(f"Máximo {FOTO_MAX_MB} MB.")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["foto_perfil"] = (
            instance.foto_perfil.url if instance.foto_perfil else None
        )
        return data


class CambiarClaveSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, max_length=64)
    new_password = serializers.CharField(write_only=True, max_length=64)

    def validate_old_password(self, value):
        if not value:
            raise serializers.ValidationError("Escribe tu clave actual.")
        if len(value) > 64:
            raise serializers.ValidationError("Máximo 64 caracteres.")
        return value

    def validate_new_password(self, value):
        return exigir_clave(value)

    def validate(self, attrs):
        usuario = self.context["request"].user
        if usuario.password_hash != attrs["old_password"]:
            raise serializers.ValidationError(
                {"old_password": "La clave actual no es correcta."}
            )
        if attrs["old_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "La nueva clave debe ser distinta a la actual."}
            )
        return attrs
