from rest_framework import serializers

from core.fechas import con_zona

from .models import TurnoCaja


class TurnoAuditoriaSerializer(serializers.ModelSerializer):
    terminal_serie = serializers.CharField(source="terminal.numero_serie", read_only=True)
    cajero = serializers.SerializerMethodField()
    sucursal_nombre = serializers.CharField(
        source="terminal.sucursal.nombre",
        read_only=True,
    )
    fecha_apertura = serializers.SerializerMethodField()
    fecha_cierre = serializers.SerializerMethodField()

    class Meta:
        model = TurnoCaja
        fields = (
            "id_turno",
            "terminal_serie",
            "cajero",
            "sucursal_nombre",
            "fecha_apertura",
            "fecha_cierre",
            "monto_apertura",
            "monto_esperado",
            "monto_cierre_real",
            "descuadre",
            "estado",
            "auditado",
        )

    def get_cajero(self, obj):
        u = obj.usuario
        return f"{u.nombre} {u.apellido}".strip() or u.username

    def get_fecha_apertura(self, obj):
        return con_zona(obj.fecha_apertura)

    def get_fecha_cierre(self, obj):
        return con_zona(obj.fecha_cierre)


class TicketResumenSerializer(serializers.Serializer):
    id_venta = serializers.IntegerField()
    fecha_hora = serializers.SerializerMethodField()
    total_factura = serializers.DecimalField(max_digits=10, decimal_places=2)
    anulada = serializers.BooleanField()

    def get_fecha_hora(self, obj):
        return con_zona(obj.get("fecha_hora") if isinstance(obj, dict) else obj.fecha_hora)


class DesgloseTurnoSerializer(serializers.Serializer):
    id_turno = serializers.IntegerField()
    terminal_serie = serializers.CharField()
    cajero = serializers.CharField()
    fecha_apertura = serializers.SerializerMethodField()
    fecha_cierre = serializers.SerializerMethodField()
    auditado = serializers.BooleanField()
    estado = serializers.CharField()
    monto_apertura = serializers.DecimalField(max_digits=10, decimal_places=2)
    ventas_efectivo = serializers.DecimalField(max_digits=10, decimal_places=2)
    ventas_tarjeta = serializers.DecimalField(max_digits=10, decimal_places=2)
    ventas_transferencia = serializers.DecimalField(max_digits=10, decimal_places=2)
    ventas_otros = serializers.DecimalField(max_digits=10, decimal_places=2)
    monto_esperado = serializers.DecimalField(max_digits=10, decimal_places=2)
    monto_cierre_real = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True
    )
    descuadre = serializers.DecimalField(max_digits=10, decimal_places=2)
    tickets = TicketResumenSerializer(many=True)

    def get_fecha_apertura(self, obj):
        return con_zona(obj["fecha_apertura"])

    def get_fecha_cierre(self, obj):
        return con_zona(obj["fecha_cierre"])
