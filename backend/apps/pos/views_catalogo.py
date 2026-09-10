from django.db.models import IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets

from apps.inventario.models import Categoria, InventarioStock, Producto
from apps.inventario.serializers import CategoriaSerializer
from core.paginacion import entero

from .filters import CatalogoGlobalPosFilter, CatalogoPosFilter, ClienteFilter
from .models import Cliente
from .permisos import PuedeVender
from .serializers import (
    CatalogoGlobalPosSerializer,
    CatalogoPosSerializer,
    ClienteSerializer,
)
from .services.turnos import turno_abierto

RELACIONES = ("producto", "producto__categoria")


def sucursal_activa(request):
    """Se vende donde está la caja; si no hay turno, la sucursal del perfil."""
    turno = turno_abierto(request.user)
    if turno is not None:
        return turno.terminal.sucursal_id
    if request.user.sucursal_id:
        return request.user.sucursal_id
    return entero(request.query_params.get("sucursal"), None)


class CatalogoPosViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Grilla visual: solo productos con InventarioStock en la sucursal del cajero."""

    serializer_class = CatalogoPosSerializer
    permission_classes = [PuedeVender]
    filter_backends = [DjangoFilterBackend]
    filterset_class = CatalogoPosFilter

    def get_queryset(self):
        sucursal = sucursal_activa(self.request)
        stock = InventarioStock.objects.select_related(*RELACIONES)
        if sucursal is None:
            return stock.none()
        return stock.filter(sucursal_id=sucursal)


class CatalogoLocalPosViewSet(CatalogoPosViewSet):
    """Alias explícito de la grilla local (`/api/pos/catalogo-local/`)."""


class CatalogoGlobalPosViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Pistola / buscador: catálogo global de la empresa + stock local anotado."""

    serializer_class = CatalogoGlobalPosSerializer
    permission_classes = [PuedeVender]
    filter_backends = [DjangoFilterBackend]
    filterset_class = CatalogoGlobalPosFilter

    def get_queryset(self):
        sucursal = sucursal_activa(self.request)
        stock_local = InventarioStock.objects.filter(
            producto_id=OuterRef("pk"),
            sucursal_id=sucursal if sucursal is not None else -1,
        ).values("cantidad_actual")[:1]
        return (
            Producto.objects.select_related("categoria")
            .annotate(
                cantidad_actual=Coalesce(
                    Subquery(stock_local, output_field=IntegerField()),
                    Value(0),
                )
            )
            .order_by("nombre")
        )


class CategoriaPosViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = CategoriaSerializer
    permission_classes = [PuedeVender]

    def get_queryset(self):
        sucursal = sucursal_activa(self.request)
        if sucursal is None:
            return Categoria.objects.none()
        return Categoria.objects.filter(
            productos__stock__sucursal_id=sucursal
        ).distinct()


class ClienteViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [PuedeVender]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ClienteFilter
