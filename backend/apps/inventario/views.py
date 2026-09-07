from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.paginacion import entero, pagina_manual, tamano_pedido

from .filters import ProductoFilter
from .models import Categoria, HistorialMovimiento, InventarioStock, Producto
from .permisos import PuedeGestionarInventario, limitar_a_sucursal
from .serializers import CategoriaSerializer, ProductoSerializer
from .serializers_kardex import MovimientoSerializer
from .serializers_stock import StockSerializer

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

    @action(detail=True, methods=["get"])
    def kardex(self, request, pk=None):
        producto = self.get_object()
        solicitada = request.query_params.get("sucursal") or None

        stock = limitar_a_sucursal(
            InventarioStock.objects.select_related(
                "sucursal", "producto", "producto__categoria"
            ).filter(producto=producto),
            request.user,
            solicitada,
        )
        movimientos = limitar_a_sucursal(
            HistorialMovimiento.objects.select_related("sucursal", "usuario").filter(
                producto=producto
            ),
            request.user,
            solicitada,
        )

        return Response(
            {
                "producto": ProductoSerializer(producto).data,
                "stock_actual": sum(fila.cantidad_actual for fila in stock),
                "stock_por_sucursal": StockSerializer(stock, many=True).data,
                "movimientos": pagina_manual(
                    movimientos,
                    entero(request.query_params.get("page"), 1),
                    tamano_pedido(request),
                    MovimientoSerializer,
                ),
            }
        )
