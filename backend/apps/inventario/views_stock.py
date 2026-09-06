from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .filters import LoteFilter, MermaFilter, StockFilter
from .models import InventarioStock, LoteCaducidad, RegistroMerma
from .permisos import PuedeGestionarInventario, limitar_a_sucursal, sucursal_visible
from .serializers_stock import (
    AjusteStockSerializer,
    LoteSerializer,
    MermaSerializer,
    StockSerializer,
)
from .services.stock import ajustar_stock, registrar_merma, sumar_stock

RELACIONES = ("producto", "producto__categoria", "sucursal")


def resolver_sucursal(request, serializer):
    """El bodeguero siempre opera en su sucursal; el admin debe indicarla."""
    solicitada = serializer.validated_data.pop("sucursal", None)
    sucursal = sucursal_visible(request.user, getattr(solicitada, "pk", solicitada))
    if sucursal is None:
        raise ValidationError({"sucursal": "Indica la sucursal."})
    return sucursal


class StockViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = StockSerializer
    permission_classes = [PuedeGestionarInventario]
    filter_backends = [DjangoFilterBackend]
    filterset_class = StockFilter

    def get_queryset(self):
        stock = InventarioStock.objects.select_related(*RELACIONES)
        return limitar_a_sucursal(stock, self.request.user)

    @action(detail=False, methods=["post"])
    def ajustar(self, request):
        datos = AjusteStockSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        sucursal = resolver_sucursal(request, datos)
        fila = ajustar_stock(
            sucursal,
            datos.validated_data["producto"],
            datos.validated_data["cantidad_actual"],
            datos.validated_data["stock_minimo"],
        )
        return Response(StockSerializer(fila).data)


class LoteViewSet(viewsets.ModelViewSet):
    serializer_class = LoteSerializer
    permission_classes = [PuedeGestionarInventario]
    filter_backends = [DjangoFilterBackend]
    filterset_class = LoteFilter

    def get_queryset(self):
        lotes = LoteCaducidad.objects.select_related(*RELACIONES)
        return limitar_a_sucursal(lotes, self.request.user)

    def perform_create(self, serializer):
        sucursal = resolver_sucursal(self.request, serializer)
        lote = serializer.save(sucursal_id=sucursal)
        sumar_stock(sucursal, lote.producto, lote.cantidad)


class MermaViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = MermaSerializer
    permission_classes = [PuedeGestionarInventario]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MermaFilter

    def get_queryset(self):
        mermas = RegistroMerma.objects.select_related(*RELACIONES, "usuario")
        return limitar_a_sucursal(mermas, self.request.user)

    def perform_create(self, serializer):
        sucursal = resolver_sucursal(self.request, serializer)
        registrar_merma(serializer, self.request.user, sucursal)
