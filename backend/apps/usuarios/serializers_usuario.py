from rest_framework import serializers

from .models import Usuario
from .validadores import exigir_clave, exigir_nombre, exigir_username

ROL_ADMIN = "administrador"


class UsuarioSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source="rol.nombre", read_only=True)
    sucursal_nombre = serializers.CharField(
        source="sucursal.nombre",
        read_only=True,
        default="",
    )
    nombre_completo = serializers.SerializerMethodField()
    clave = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = (
            "id_usuario",
            "username",
            "nombre",
            "apellido",
            "nombre_completo",
            "rol",
            "rol_nombre",
            "sucursal",
            "sucursal_nombre",
            "clave",
            "estado_activo",
        )
        extra_kwargs = {
            "username": {"max_length": 30},
            "nombre": {"max_length": 40},
            "apellido": {"max_length": 40},
            "sucursal": {"required": False, "allow_null": True},
        }
        read_only_fields = ("estado_activo",)

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}".strip()

    def validate_username(self, value):
        username = exigir_username(value)
        consulta = Usuario.objects.filter(username__iexact=username)
        if self.instance:
            consulta = consulta.exclude(pk=self.instance.pk)
        if consulta.exists():
            raise serializers.ValidationError("Ese usuario ya existe.")
        return username

    def validate_nombre(self, value):
        return exigir_nombre(value, "Nombre")

    def validate_apellido(self, value):
        return exigir_nombre(value, "Apellido")

    def validate_clave(self, value):
        if not value:
            return value
        return exigir_clave(value)

    def validate(self, attrs):
        if self.instance is None and not attrs.get("clave"):
            raise serializers.ValidationError(
                {"clave": "La contraseña inicial es obligatoria."}
            )
        rol = attrs.get("rol", getattr(self.instance, "rol", None))
        if "sucursal" in attrs:
            sucursal = attrs.get("sucursal")
        else:
            sucursal = getattr(self.instance, "sucursal", None)
        nombre_rol = (getattr(rol, "nombre", "") or "").strip().lower()
        if nombre_rol == ROL_ADMIN:
            attrs["sucursal"] = None
        elif sucursal is None:
            raise serializers.ValidationError(
                {"sucursal": "Asigna una sucursal al empleado."}
            )
        return attrs

    def create(self, validated):
        clave = validated.pop("clave", "")
        validated["password_hash"] = clave
        return super().create(validated)

    def update(self, instance, validated):
        validated.pop("clave", None)
        return super().update(instance, validated)
