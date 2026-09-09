import django_filters as filters
from django.db.models import Q

from apps.inventario.models import InventarioStock

from .models import Cliente


class CatalogoPosFilter(filters.FilterSet):
    """Búsqueda de mostrador: la pistola manda el SKU, el cajero el nombre."""

    buscar = filters.CharFilter(method="filtrar_buscar")
    categoria = filters.NumberFilter(field_name="producto__categoria_id")
    con_stock = filters.BooleanFilter(method="filtrar_con_stock")

    class Meta:
        model = InventarioStock
        fields = ("categoria",)

    def filtrar_buscar(self, queryset, _name, value):
        texto = (value or "").strip()
        if not texto:
            return queryset
        return queryset.filter(
            Q(producto__sku__icontains=texto) | Q(producto__nombre__icontains=texto)
        )

    def filtrar_con_stock(self, queryset, _name, value):
        if not value:
            return queryset
        return queryset.filter(cantidad_actual__gt=0)


class ClienteFilter(filters.FilterSet):
    buscar = filters.CharFilter(method="filtrar_buscar")

    class Meta:
        model = Cliente
        fields = ("cedula_ruc",)

    def filtrar_buscar(self, queryset, _name, value):
        texto = (value or "").strip()
        if not texto:
            return queryset
        return queryset.filter(
            Q(cedula_ruc__icontains=texto)
            | Q(nombres__icontains=texto)
            | Q(apellidos__icontains=texto)
        )
