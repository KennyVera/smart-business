from decimal import Decimal

from rest_framework import serializers

from .models import Categoria, Producto, Proveedor
from .validadores import (
    clave_categoria,
    exigir_direccion,
    exigir_email,
    exigir_nombre_categoria,
    exigir_nombre_contacto,
    exigir_nombre_libre,
    exigir_sku,
)


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
        clave = clave_categoria(nombre)
        for existente in Categoria.objects.all():
            if self.instance and existente.pk == self.instance.pk:
                continue
            if clave_categoria(existente.nombre) == clave:
                raise serializers.ValidationError(
                    "Esa categoría ya existe (incluye variantes sin tilde)."
                )
        return nombre


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = (
            "id_proveedor",
            "ruc",
            "razon_social",
            "nombre_contacto",
            "telefono",
            "email",
            "direccion",
        )
        extra_kwargs = {
            "razon_social": {"max_length": 150},
            "nombre_contacto": {"max_length": 100},
            "email": {"max_length": 100},
        }

    def validate_ruc(self, value):
        ruc = "".join(ch for ch in str(value or "") if ch.isdigit())
        if len(ruc) != 13:
            raise serializers.ValidationError("El RUC debe tener 13 dígitos.")
        consulta = Proveedor.objects.filter(ruc=ruc)
        if self.instance:
            consulta = consulta.exclude(pk=self.instance.pk)
        if consulta.exists():
            raise serializers.ValidationError("Ese RUC ya está registrado.")
        return ruc

    def validate_telefono(self, value):
        telefono = "".join(ch for ch in str(value or "") if ch.isdigit())
        if len(telefono) != 10:
            raise serializers.ValidationError("El teléfono debe tener 10 dígitos.")
        return telefono

    def validate_razon_social(self, value):
        return exigir_nombre_libre(value, "La razón social")

    def validate_nombre_contacto(self, value):
        return exigir_nombre_contacto(value)

    def validate_email(self, value):
        return exigir_email(value)

    def validate_direccion(self, value):
        return exigir_direccion(value)


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    margen_porcentaje = serializers.SerializerMethodField()
    proveedor_info = ProveedorSerializer(source="proveedor", read_only=True)

    class Meta:
        model = Producto
        fields = (
            "id_producto",
            "sku",
            "nombre",
            "categoria",
            "categoria_nombre",
            "proveedor",
            "proveedor_info",
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
            "proveedor": {"required": False, "allow_null": True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["imagen"] = instance.imagen.url if instance.imagen else None
        if data.get("proveedor_info"):
            data["proveedor_info"] = {
                "id_proveedor": data["proveedor_info"]["id_proveedor"],
                "razon_social": data["proveedor_info"]["razon_social"],
                "telefono": data["proveedor_info"]["telefono"],
            }
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
