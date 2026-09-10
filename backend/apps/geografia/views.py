from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
import django_filters as filters
from rest_framework import viewsets

from .models import Canton, Provincia, ZonaPlanificacion
from .serializers import (
    CantonSerializer,
    ProvinciaSerializer,
    ZonaPlanificacionSerializer,
)
from .views_sucursal import SucursalViewSet

__all__ = [
    "ZonaPlanificacionViewSet",
    "ProvinciaViewSet",
    "CantonViewSet",
    "SucursalViewSet",
    # Compat
    "SubzonaViewSet",
    "CantonDistritoViewSet",
]


class ZonaPlanificacionFilter(filters.FilterSet):
    """Busca por zona, provincia o cantón (ej. Quevedo → Zona 5)."""

    buscar = filters.CharFilter(method="filtrar_buscar")

    class Meta:
        model = ZonaPlanificacion
        fields = ()

    def filtrar_buscar(self, queryset, _name, value):
        texto = (value or "").strip()
        if not texto:
            return queryset
        return queryset.filter(
            Q(nombre__icontains=texto)
            | Q(descripcion__icontains=texto)
            | Q(provincias__nombre__icontains=texto)
            | Q(provincias__cantones__nombre__icontains=texto)
        ).distinct()


class ProvinciaFilter(filters.FilterSet):
    zona = filters.CharFilter(field_name="zona_id")
    buscar = filters.CharFilter(method="filtrar_buscar")

    class Meta:
        model = Provincia
        fields = ("zona",)

    def filtrar_buscar(self, queryset, _name, value):
        texto = (value or "").strip()
        if not texto:
            return queryset
        return queryset.filter(nombre__icontains=texto)


class CantonFilter(filters.FilterSet):
    provincia = filters.CharFilter(field_name="provincia_id")
    zona = filters.CharFilter(field_name="provincia__zona_id")
    buscar = filters.CharFilter(method="filtrar_buscar")

    class Meta:
        model = Canton
        fields = ("provincia", "zona")

    def filtrar_buscar(self, queryset, _name, value):
        texto = (value or "").strip()
        if not texto:
            return queryset
        return queryset.filter(
            Q(nombre__icontains=texto) | Q(provincia__nombre__icontains=texto)
        )


class ZonaPlanificacionViewSet(viewsets.ModelViewSet):
    queryset = ZonaPlanificacion.objects.all()
    serializer_class = ZonaPlanificacionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ZonaPlanificacionFilter


class ProvinciaViewSet(viewsets.ModelViewSet):
    queryset = Provincia.objects.select_related("zona")
    serializer_class = ProvinciaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProvinciaFilter


class CantonViewSet(viewsets.ModelViewSet):
    queryset = Canton.objects.select_related("provincia", "provincia__zona")
    serializer_class = CantonSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CantonFilter


# Alias de rutas legacy.
SubzonaViewSet = ProvinciaViewSet
CantonDistritoViewSet = CantonViewSet
