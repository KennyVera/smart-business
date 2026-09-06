from datetime import date

from rest_framework import serializers

from .models import InventarioStock, LoteCaducidad, Producto, RegistroMerma
from .validadores import exigir_codigo_lote, exigir_motivo


class StockSerializer(serializers.ModelSerializer):
    id_sucursal = serializers.IntegerField(source="sucursal_id", read_only=True)
    id_producto = serializers.IntegerField(source="producto_id", read_only=True)
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)
    sku = serializers.CharField(source="producto.sku", read_only=True)
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    categoria_nombre = serializers.CharField(
        source="producto.categoria.nombre",
        read_only=True,
    )
    en_alerta = serializers.SerializerMethodField()
    faltante = serializers.SerializerMethodField()

    class Meta:
        model = InventarioStock
        fields = (
            "id_sucursal",
            "id_producto",
            "sucursal_nombre",
            "sku",
            "producto_nombre",
            "categoria_nombre",
            "cantidad_actual",
            "stock_minimo",
            "en_alerta",
            "faltante",
        )

    def get_en_alerta(self, obj):
        return obj.cantidad_actual <= obj.stock_minimo

    def get_faltante(self, obj):
        return max(obj.stock_minimo - obj.cantidad_actual, 0)


class AjusteStockSerializer(serializers.Serializer):
    sucursal = serializers.IntegerField(required=False, allow_null=True)
    producto = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all())
    cantidad_actual = serializers.IntegerField(min_value=0, max_value=999999)
    stock_minimo = serializers.IntegerField(min_value=0, max_value=999999)


class LoteSerializer(serializers.ModelSerializer):
    sku = serializers.CharField(source="producto.sku", read_only=True)
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)
    dias_para_vencer = serializers.SerializerMethodField()

    class Meta:
        model = LoteCaducidad
        fields = (
            "id_lote",
            "sucursal",
            "sucursal_nombre",
            "producto",
            "sku",
            "producto_nombre",
            "codigo_lote",
            "fecha_vencimiento",
            "cantidad",
            "dias_para_vencer",
        )
        extra_kwargs = {
            "cantidad": {"min_value": 1, "max_value": 999999},
            "sucursal": {"required": False},
        }

    def get_dias_para_vencer(self, obj):
        return (obj.fecha_vencimiento - date.today()).days

    def validate_codigo_lote(self, value):
        return exigir_codigo_lote(value)


class MermaSerializer(serializers.ModelSerializer):
    sku = serializers.CharField(source="producto.sku", read_only=True)
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)
    usuario_nombre = serializers.CharField(source="usuario.username", read_only=True)

    class Meta:
        model = RegistroMerma
        fields = (
            "id_merma",
            "sucursal",
            "sucursal_nombre",
            "producto",
            "sku",
            "producto_nombre",
            "usuario_nombre",
            "cantidad",
            "motivo",
            "fecha",
        )
        extra_kwargs = {
            "cantidad": {"min_value": 1, "max_value": 999999},
            "sucursal": {"required": False},
        }

    def validate_motivo(self, value):
        return exigir_motivo(value)
