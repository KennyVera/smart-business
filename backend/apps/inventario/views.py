from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from .filters import ProductoFilter
from .models import Categoria, Producto
from .permisos import PuedeGestionarInventario
from .serializers import CategoriaSerializer, ProductoSerializer

SIN_BORRADO = ["get", "post", "put", "patch", "head", "options"]


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [PuedeGestionarInventario]
    http_method_names = SIN_BORRADO


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related("categoria")
    serializer_class = ProductoSerializer
    permission_classes = [PuedeGestionarInventario]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductoFilter
    http_method_names = SIN_BORRADO
