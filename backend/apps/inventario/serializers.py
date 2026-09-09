from decimal import Decimal

from rest_framework import serializers

from .models import Categoria, Producto
from .validadores import exigir_nombre_categoria, exigir_nombre_libre, exigir_sku


class CategoriaSerializer(serializers.ModelSerializer):
    total_productos = serializers.IntegerField(
        source="productos.count",
        read_only=True,
    )

    class Meta:
        model = Categoria
        fields = ("id_categoria", "nombre", "total_productos")
        extra_kwargs = {"nombre": {"max_length": 40}}

    def validate_nombre(self, value):
        nombre = exigir_nombre_categoria(value)
        consulta = Categoria.objects.filter(nombre__iexact=nombre)
        if self.instance:
            consulta = consulta.exclude(pk=self.instance.pk)
        if consulta.exists():
            raise serializers.ValidationError("Esa categoría ya existe.")
        return nombre


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    margen_porcentaje = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = (
            "id_producto",
            "sku",
            "nombre",
            "categoria",
            "categoria_nombre",
            "costo_actual",
            "precio_venta",
            "imagen",
            "aplica_iva",
            "margen_porcentaje",
        )
        extra_kwargs = {
            "sku": {"max_length": 50},
            "nombre": {"max_length": 150},
            "costo_actual": {"min_value": Decimal("0")},
            "precio_venta": {"min_value": Decimal("0.01")},
            "imagen": {"required": False, "allow_null": True},
            "aplica_iva": {"required": False},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["imagen"] = instance.imagen.url if instance.imagen else None
        return data

    def get_margen_porcentaje(self, obj):
        precio = obj.precio_venta or Decimal("0")
        if precio <= 0:
            return None
        margen = ((precio - obj.costo_actual) / precio) * 100
        return round(float(margen), 2)

    def validate_sku(self, value):
        sku = exigir_sku(value)
        consulta = Producto.objects.filter(sku__iexact=sku)
        if self.instance:
            consulta = consulta.exclude(pk=self.instance.pk)
        if consulta.exists():
            raise serializers.ValidationError("Ese código de barras ya está en uso.")
        return sku

    def validate_nombre(self, value):
        return exigir_nombre_libre(value, "El producto")

    def validate_costo_actual(self, value):
        if value < 0:
            raise serializers.ValidationError("El costo no puede ser negativo.")
        return value

    def validate_precio_venta(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio de venta debe ser mayor a 0.")
        return value
