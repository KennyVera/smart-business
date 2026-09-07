from rest_framework import serializers

from .models import HistorialMovimiento


class MovimientoSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.CharField(source="get_tipo_display", read_only=True)
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = HistorialMovimiento
        fields = (
            "id_movimiento",
            "fecha",
            "tipo",
            "tipo_nombre",
            "cantidad",
            "stock_resultante",
            "referencia",
            "sucursal_nombre",
            "usuario_nombre",
        )

    def get_usuario_nombre(self, obj):
        if obj.usuario is None:
            return "Sistema"
        return f"{obj.usuario.nombre} {obj.usuario.apellido}".strip() or obj.usuario.username
