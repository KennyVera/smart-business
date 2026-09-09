from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets

from apps.inventario.models import Categoria, InventarioStock
from apps.inventario.serializers import CategoriaSerializer
from core.paginacion import entero

from .filters import CatalogoPosFilter, ClienteFilter
from .models import Cliente
from .permisos import PuedeVender
from .serializers import CatalogoPosSerializer, ClienteSerializer
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
    """Vitrina de venta: solo lectura, para que el cajero no toque el catálogo."""

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
