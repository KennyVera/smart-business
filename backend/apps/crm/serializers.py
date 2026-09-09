from rest_framework import serializers

from .models import Cliente
from .validadores import (
    CORREO_MAX,
    NOMBRE_MAX,
    TELEFONO_MAX,
    limpiar_nombre,
    mensaje_correo,
    mensaje_identificacion,
    mensaje_nombre,
    mensaje_telefono,
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


class ClienteGerenteListSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.CharField(read_only=True)
    cedula = serializers.CharField(source="cedula_ruc", read_only=True)
    total_gastado = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    frecuencia_visitas = serializers.IntegerField(read_only=True)
    ultima_compra = serializers.SerializerMethodField()
    es_vip = serializers.SerializerMethodField()
    cumple_mes = serializers.SerializerMethodField()

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
            "fecha_nacimiento",
            "total_gastado",
            "frecuencia_visitas",
            "ultima_compra",
            "es_vip",
            "cumple_mes",
        )

    def get_ultima_compra(self, obj):
        from django.utils import timezone

        valor = getattr(obj, "ultima_compra", None)
        if not valor:
            return None
        if timezone.is_naive(valor):
            valor = timezone.make_aware(valor, timezone.get_current_timezone())
        else:
            valor = timezone.localtime(valor)
        return valor.isoformat()

    def get_es_vip(self, obj):
        gastado = obj.total_gastado or 0
        visitas = obj.frecuencia_visitas or 0
        return gastado >= 500 or visitas >= 10

    def get_cumple_mes(self, obj):
        from django.utils import timezone

        if not obj.fecha_nacimiento:
            return False
        return obj.fecha_nacimiento.month == timezone.localdate().month


class ClienteGerenteDetalleSerializer(ClienteGerenteListSerializer):
    """Misma base de lista; el ViewSet agrega top_productos/historial."""

    class Meta(ClienteGerenteListSerializer.Meta):
        fields = ClienteGerenteListSerializer.Meta.fields + ("puntos_acumulados",)


class ClienteGerenteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ("telefono", "correo", "fecha_nacimiento")
        extra_kwargs = {
            "telefono": {"required": False, "allow_blank": True, "allow_null": True},
            "correo": {"required": False, "allow_blank": True, "allow_null": True},
            "fecha_nacimiento": {"required": False, "allow_null": True},
        }

    def validate_correo(self, value):
        correo = (value or "").strip()
        aviso = mensaje_correo(correo)
        if aviso:
            raise serializers.ValidationError(aviso)
        return correo[:CORREO_MAX] or None

    def validate_telefono(self, value):
        telefono = (value or "").strip()
        if not telefono:
            return None
        digitos = solo_digitos(telefono)
        aviso = mensaje_telefono(digitos)
        if aviso:
            raise serializers.ValidationError(aviso)
        return digitos[:TELEFONO_MAX]
