from datetime import date, timedelta

import django_filters as filters
from django.db.models import DecimalField, ExpressionWrapper, F, Q

from .models import InventarioStock, LoteCaducidad, Producto, RegistroMerma

MARGEN_ALEGRE = 30
MARGEN_TRISTE = 15

PORCENTAJE_MARGEN = ExpressionWrapper(
    (F("precio_venta") - F("costo_actual")) * 100 / F("precio_venta"),
    output_field=DecimalField(max_digits=10, decimal_places=4),
)


class ProductoFilter(filters.FilterSet):
    sku = filters.CharFilter(lookup_expr="icontains")
    nombre = filters.CharFilter(lookup_expr="icontains")
    categoria = filters.NumberFilter(field_name="categoria_id")
    sucursal = filters.NumberFilter(method="filtrar_sucursal")
    buscar = filters.CharFilter(method="filtrar_texto")
    margen = filters.ChoiceFilter(
        choices=(("alegre", "alegre"), ("medio", "medio"), ("triste", "triste")),
        method="filtrar_margen",
    )

    class Meta:
        model = Producto
        fields = ("sku", "nombre", "categoria", "sucursal")

    def filtrar_sucursal(self, queryset, _name, value):
        return queryset.filter(stock__sucursal_id=value).distinct()

    def filtrar_texto(self, queryset, _name, value):
        texto = value.strip()
        if not texto:
            return queryset
        return queryset.filter(Q(sku__icontains=texto) | Q(nombre__icontains=texto))

    def filtrar_margen(self, queryset, _name, value):
        """El margen no se guarda (3FN): se calcula en la consulta."""
        marcados = queryset.filter(precio_venta__gt=0).annotate(
            margen_calculado=PORCENTAJE_MARGEN
        )
        if value == "alegre":
            return marcados.filter(margen_calculado__gte=MARGEN_ALEGRE)
        if value == "triste":
            return marcados.filter(margen_calculado__lt=MARGEN_TRISTE)
        return marcados.filter(
            margen_calculado__gte=MARGEN_TRISTE,
            margen_calculado__lt=MARGEN_ALEGRE,
        )


class StockFilter(filters.FilterSet):
    sucursal = filters.NumberFilter(field_name="sucursal_id")
    producto = filters.NumberFilter(field_name="producto_id")
    categoria = filters.NumberFilter(field_name="producto__categoria_id")
    buscar = filters.CharFilter(method="filtrar_texto")
    solo_alerta = filters.BooleanFilter(method="filtrar_alerta")

    class Meta:
        model = InventarioStock
        fields = ("sucursal", "producto", "categoria")

    def filtrar_texto(self, queryset, _name, value):
        texto = value.strip()
        if not texto:
            return queryset
        return queryset.filter(
            Q(producto__sku__icontains=texto) | Q(producto__nombre__icontains=texto)
        )

    def filtrar_alerta(self, queryset, _name, value):
        if not value:
            return queryset
        return queryset.filter(cantidad_actual__lte=F("stock_minimo"))


class LoteFilter(filters.FilterSet):
    sucursal = filters.NumberFilter(field_name="sucursal_id")
    producto = filters.NumberFilter(field_name="producto_id")
    dias = filters.NumberFilter(method="filtrar_dias")

    class Meta:
        model = LoteCaducidad
        fields = ("sucursal", "producto")

    def filtrar_dias(self, queryset, _name, value):
        limite = date.today() + timedelta(days=int(value))
        return queryset.filter(fecha_vencimiento__lte=limite)


class MermaFilter(filters.FilterSet):
    sucursal = filters.NumberFilter(field_name="sucursal_id")
    producto = filters.NumberFilter(field_name="producto_id")

    class Meta:
        model = RegistroMerma
        fields = ("sucursal", "producto")
