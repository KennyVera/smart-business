from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Venta
from .permisos import EsGerenteSucursal, PuedeVender, es_cajero, es_gerente
from .serializers import ProcesarVentaSerializer, VentaSerializer
from .services.devoluciones import anular_venta
from .services.turnos import resumen_turno, turno_abierto
from .services.ventas import procesar_venta

RELACIONES = (
    "turno",
    "turno__usuario",
    "turno__terminal",
    "turno__terminal__sucursal",
    "cliente",
)
DETALLES = ("detalles__producto", "pagos__metodo_pago")


class VentaViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = VentaSerializer
    permission_classes = [PuedeVender]

    def get_queryset(self):
        ventas = Venta.objects.select_related(*RELACIONES).prefetch_related(*DETALLES)
        if es_cajero(self.request.user):
            return ventas.filter(turno__usuario=self.request.user)
        if self.request.user.sucursal_id:
            return ventas.filter(
                turno__terminal__sucursal_id=self.request.user.sucursal_id
            )
        return ventas

    @action(detail=False, methods=["post"], url_path="procesar")
    def procesar(self, request):
        """Cobra el ticket dentro de una sola transacción atómica."""
        datos = ProcesarVentaSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        turno = turno_abierto(request.user)
        if turno is None:
            raise ValidationError(
                {"detail": "Abre un turno de caja antes de registrar ventas."}
            )
        venta, total, cambio = procesar_venta(turno, datos.validated_data, request.user)
        return Response(
            {
                "venta": VentaSerializer(venta).data,
                "total": total,
                "subtotal_iva_0": venta.subtotal_iva_0,
                "subtotal_iva_15": venta.subtotal_iva_15,
                "monto_iva": venta.monto_iva,
                "monto_recibido": venta.monto_recibido,
                "cambio": venta.cambio,
                "resumen": resumen_turno(turno),
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[EsGerenteSucursal],
    )
    def anular(self, request, pk=None):
        """Autoriza devolución: restockea la sucursal del ticket y anula."""
        if es_gerente(request.user) and not request.user.sucursal_id:
            raise ValidationError({"detail": "Gerente sin sucursal asignada."})
        venta = self.get_object()
        anulada = anular_venta(venta, request.user)
        return Response({"venta": VentaSerializer(anulada).data})
