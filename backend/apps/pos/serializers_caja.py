from decimal import Decimal

from rest_framework import serializers

from core.fechas import con_zona

from .models import MetodoPago, TerminalPOS, TurnoCaja

MONTO_MAXIMO = Decimal("100000.00")


class MetodoPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoPago
        fields = ("id_metodo_pago", "nombre")


class TerminalSerializer(serializers.ModelSerializer):
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)

    class Meta:
        model = TerminalPOS
        fields = (
            "id_terminal",
            "sucursal",
            "sucursal_nombre",
            "numero_serie",
            "estado_activo",
        )


class TurnoSerializer(serializers.ModelSerializer):
    terminal_serie = serializers.CharField(source="terminal.numero_serie", read_only=True)
    sucursal = serializers.IntegerField(source="terminal.sucursal_id", read_only=True)
    sucursal_nombre = serializers.CharField(
        source="terminal.sucursal.nombre",
        read_only=True,
    )
    cajero = serializers.SerializerMethodField()
    abierto = serializers.BooleanField(source="esta_abierto", read_only=True)
    fecha_apertura = serializers.SerializerMethodField()
    fecha_cierre = serializers.SerializerMethodField()

    class Meta:
        model = TurnoCaja
        fields = (
            "id_turno",
            "terminal",
            "terminal_serie",
            "sucursal",
            "sucursal_nombre",
            "usuario",
            "cajero",
            "fecha_apertura",
            "fecha_cierre",
            "monto_apertura",
            "monto_esperado",
            "monto_cierre_real",
            "monto_cierre_declarado",
            "descuadre",
            "estado",
            "auditado",
            "abierto",
        )

    def get_cajero(self, obj):
        usuario = obj.usuario
        return f"{usuario.nombre} {usuario.apellido}".strip() or usuario.username

    def get_fecha_apertura(self, obj):
        return con_zona(obj.fecha_apertura)

    def get_fecha_cierre(self, obj):
        return con_zona(obj.fecha_cierre)


class AbrirTurnoSerializer(serializers.Serializer):
    terminal = serializers.PrimaryKeyRelatedField(
        queryset=TerminalPOS.objects.filter(estado_activo=True),
        required=False,
        allow_null=True,
    )
    monto_apertura = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0"),
        max_value=MONTO_MAXIMO,
        default=Decimal("0.00"),
    )


class CerrarTurnoSerializer(serializers.Serializer):
    monto_cierre_real = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0"),
        max_value=MONTO_MAXIMO,
        required=False,
    )
    monto_cierre_declarado = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0"),
        max_value=MONTO_MAXIMO,
        required=False,
    )

    def validate(self, attrs):
        real = attrs.get("monto_cierre_real")
        declarado = attrs.get("monto_cierre_declarado")
        if real is None and declarado is None:
            raise serializers.ValidationError(
                {"monto_cierre_real": "Indica el efectivo contado en caja."}
            )
        attrs["monto_cierre_real"] = real if real is not None else declarado
        return attrs
