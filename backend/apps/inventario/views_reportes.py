from datetime import date, datetime, time, timedelta

from django.db.models import Max
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .models import HistorialMovimiento, InventarioStock, RegistroMerma
from .permisos import PuedeGestionarInventario, limitar_a_sucursal
from .services import reportes

RELACIONES = ("producto", "producto__categoria", "sucursal")
DIAS_SIN_ROTACION = 60
DIAS_MERMAS = 30


def entero(valor, defecto):
    try:
        return max(int(valor), 0)
    except (TypeError, ValueError):
        return defecto


def fecha(valor, defecto):
    try:
        return date.fromisoformat(valor)
    except (TypeError, ValueError):
        return defecto


def ultimos_por_producto(movimientos):
    """Fecha del último movimiento de cada par producto/sucursal."""
    return {
        (item["producto_id"], item["sucursal_id"]): item["ultima"]
        for item in movimientos.values("producto_id", "sucursal_id").annotate(
            ultima=Max("fecha")
        )
    }


class ReportesInventarioViewSet(GenericViewSet):
    """Reportes operativos con datos ya agrupados para graficar."""

    permission_classes = [PuedeGestionarInventario]
    queryset = InventarioStock.objects.none()

    def stock(self):
        return limitar_a_sucursal(
            InventarioStock.objects.select_related(*RELACIONES),
            self.request.user,
            self.request.query_params.get("sucursal") or None,
        )

    def respuesta(self, datos):
        datos["generado"] = timezone.localtime().isoformat(timespec="seconds")
        return Response(datos)

    @action(detail=False, methods=["get"], url_path="valorizado")
    def valorizado(self, request):
        return self.respuesta(reportes.valorizado(self.stock()))

    @action(detail=False, methods=["get"], url_path="mermas")
    def mermas(self, request):
        hasta = fecha(request.query_params.get("end_date"), date.today())
        desde = fecha(
            request.query_params.get("start_date"),
            hasta - timedelta(days=DIAS_MERMAS),
        )
        if desde > hasta:
            desde, hasta = hasta, desde
        zona = timezone.get_current_timezone()
        registros = limitar_a_sucursal(
            RegistroMerma.objects.select_related(*RELACIONES, "usuario").filter(
                fecha__gte=timezone.make_aware(datetime.combine(desde, time.min), zona),
                fecha__lte=timezone.make_aware(datetime.combine(hasta, time.max), zona),
            ),
            request.user,
            request.query_params.get("sucursal") or None,
        ).order_by("-fecha")
        return self.respuesta(reportes.mermas(registros, desde, hasta))

    @action(detail=False, methods=["get"], url_path="stock-muerto")
    def stock_muerto(self, request):
        movimientos = limitar_a_sucursal(
            HistorialMovimiento.objects.all(),
            request.user,
            request.query_params.get("sucursal") or None,
        )
        return self.respuesta(
            reportes.stock_muerto(
                self.stock(),
                ultimos_por_producto(movimientos.filter(cantidad__lt=0)),
                ultimos_por_producto(movimientos),
                entero(request.query_params.get("dias"), DIAS_SIN_ROTACION),
            )
        )

    @action(detail=False, methods=["get"], url_path="sugerido-compras")
    def sugerido_compras(self, request):
        return self.respuesta(reportes.sugerido_compras(self.stock()))
