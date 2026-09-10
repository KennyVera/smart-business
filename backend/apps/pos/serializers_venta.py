from decimal import Decimal

from rest_framework import serializers

from apps.crm.models import Cliente
from apps.inventario.models import InventarioStock, Producto
from core.fechas import con_zona

from .models import MetodoPago, Venta, VentaDetalle

LINEAS_MAXIMAS = 200
CANTIDAD_MAXIMA = 9999


class CatalogoPosSerializer(serializers.ModelSerializer):
    """Producto con fila de InventarioStock en la sucursal del cajero (grilla)."""

    id_producto = serializers.IntegerField(source="producto_id", read_only=True)
    sku = serializers.CharField(source="producto.sku", read_only=True)
    nombre = serializers.CharField(source="producto.nombre", read_only=True)
    categoria = serializers.IntegerField(source="producto.categoria_id", read_only=True)
    categoria_nombre = serializers.CharField(
        source="producto.categoria.nombre",
        read_only=True,
    )
    precio_venta = serializers.DecimalField(
        source="producto.precio_venta",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    imagen = serializers.SerializerMethodField()
    aplica_iva = serializers.BooleanField(source="producto.aplica_iva", read_only=True)

    class Meta:
        model = InventarioStock
        fields = (
            "id_producto",
            "sku",
            "nombre",
            "categoria",
            "categoria_nombre",
            "precio_venta",
            "imagen",
            "aplica_iva",
            "cantidad_actual",
        )

    def get_imagen(self, obj):
        foto = obj.producto.imagen
        return foto.url if foto else None


class CatalogoGlobalPosSerializer(serializers.ModelSerializer):
    """Producto del catálogo empresa + stock local (0 si nunca se registró aquí)."""

    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    imagen = serializers.SerializerMethodField()
    cantidad_actual = serializers.IntegerField(read_only=True)

    class Meta:
        model = Producto
        fields = (
            "id_producto",
            "sku",
            "nombre",
            "categoria",
            "categoria_nombre",
            "precio_venta",
            "imagen",
            "aplica_iva",
            "cantidad_actual",
        )

    def get_imagen(self, obj):
        foto = obj.imagen
        return foto.url if foto else None


class LineaVentaSerializer(serializers.Serializer):
    producto = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all())
    cantidad = serializers.IntegerField(min_value=1, max_value=CANTIDAD_MAXIMA)


class ProcesarVentaSerializer(serializers.Serializer):
    items = LineaVentaSerializer(many=True, allow_empty=False)
    metodo_pago = serializers.PrimaryKeyRelatedField(queryset=MetodoPago.objects.all())
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        required=False,
        allow_null=True,
    )
    monto_recibido = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0"),
        required=False,
        allow_null=True,
    )
    cambio = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0"),
        required=False,
        allow_null=True,
    )

    def validate_items(self, value):
        if len(value) > LINEAS_MAXIMAS:
            raise serializers.ValidationError(
                f"El ticket admite hasta {LINEAS_MAXIMAS} líneas."
            )
        return self.agrupar(value)

    def agrupar(self, lineas):
        """El detalle es único por producto: un mismo SKU se suma en una línea."""
        agrupadas = {}
        for linea in lineas:
            producto = linea["producto"]
            actual = agrupadas.setdefault(
                producto.pk,
                {"producto": producto, "cantidad": 0},
            )
            actual["cantidad"] += linea["cantidad"]
            if actual["cantidad"] > CANTIDAD_MAXIMA:
                raise serializers.ValidationError(
                    f"{producto.nombre}: máximo {CANTIDAD_MAXIMA} unidades por venta."
                )
        return list(agrupadas.values())


class VentaDetalleSerializer(serializers.ModelSerializer):
    sku = serializers.CharField(source="producto.sku", read_only=True)
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    total_linea = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = VentaDetalle
        fields = (
            "producto",
            "sku",
            "producto_nombre",
            "cantidad",
            "precio_unitario_historico",
            "total_linea",
        )


class VentaSerializer(serializers.ModelSerializer):
    detalles = VentaDetalleSerializer(many=True, read_only=True)
    fecha_hora = serializers.SerializerMethodField()
    cliente_nombre = serializers.SerializerMethodField()
    cajero = serializers.SerializerMethodField()
    sucursal_nombre = serializers.CharField(
        source="turno.terminal.sucursal.nombre",
        read_only=True,
    )
    metodo_pago = serializers.SerializerMethodField()
    total = serializers.DecimalField(
        source="total_factura",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Venta
        fields = (
            "id_venta",
            "turno",
            "fecha_hora",
            "cliente",
            "cliente_nombre",
            "cajero",
            "sucursal_nombre",
            "metodo_pago",
            "subtotal_iva_0",
            "subtotal_iva_15",
            "monto_iva",
            "total_factura",
            "total",
            "monto_recibido",
            "cambio",
            "anulada",
            "detalles",
        )

    def get_fecha_hora(self, obj):
        return con_zona(obj.fecha_hora)

    def get_cliente_nombre(self, obj):
        if obj.cliente_id is None:
            return "Consumidor final"
        return f"{obj.cliente.nombres} {obj.cliente.apellidos}".strip()

    def get_cajero(self, obj):
        usuario = obj.turno.usuario
        return f"{usuario.nombre} {usuario.apellido}".strip() or usuario.username

    def get_metodo_pago(self, obj):
        pago = obj.pagos.first()
        return pago.metodo_pago.nombre if pago else ""
