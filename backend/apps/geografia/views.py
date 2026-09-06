from rest_framework import viewsets

from .models import CantonDistrito, Subzona, ZonaPlanificacion
from .serializers import (
    CantonDistritoSerializer,
    SubzonaSerializer,
    ZonaPlanificacionSerializer,
)
from .views_sucursal import SucursalViewSet

__all__ = [
    "ZonaPlanificacionViewSet",
    "SubzonaViewSet",
    "CantonDistritoViewSet",
    "SucursalViewSet",
]


class ZonaPlanificacionViewSet(viewsets.ModelViewSet):
    queryset = ZonaPlanificacion.objects.all()
    serializer_class = ZonaPlanificacionSerializer


class SubzonaViewSet(viewsets.ModelViewSet):
    queryset = Subzona.objects.select_related("zona")
    serializer_class = SubzonaSerializer


class CantonDistritoViewSet(viewsets.ModelViewSet):
    queryset = CantonDistrito.objects.select_related("subzona", "subzona__zona")
    serializer_class = CantonDistritoSerializer
