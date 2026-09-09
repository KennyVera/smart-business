from datetime import date, datetime, time, timedelta

from django.db.models import F, Max
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.pos.models import VentaDetalle

from .models import InventarioStock, RegistroMerma
from .permisos import PuedeGestionarInventario, limitar_a_sucursal
from .services import reportes

RELACIONES = ("producto", "producto__categoria", "sucursal")
DIAS_MERMAS = 30
SUCURSAL_VENTA = F("venta__turno__terminal__sucursal_id")


def fecha(valor, defecto):
    try:
        return date.fromisoformat(valor)
    except (TypeError, ValueError):
        return defecto


def rango_fechas(params, defecto_desde):
    """Acepta fecha_desde/fecha_hasta o start_date/end_date."""
    hasta = fecha(
        params.get("fecha_hasta") or params.get("end_date"),
        date.today(),
    )
    desde = fecha(
        params.get("fecha_desde") or params.get("start_date"),
        defecto_desde,
    )
    if desde > hasta:
        desde, hasta = hasta, desde
    return desde, hasta


def ventana_aware(desde, hasta):
    zona = timezone.get_current_timezone()
    return (
        timezone.make_aware(datetime.combine(desde, time.min), zona),
        timezone.make_aware(datetime.combine(hasta, time.max), zona),
    )


def _detalle_ventas(request):
    qs = VentaDetalle.objects.filter(venta__anulada=False)
    sucursal = request.query_params.get("sucursal") or None
    user = request.user
    if sucursal:
        return qs.filter(venta__turno__terminal__sucursal_id=sucursal)
    if getattr(user, "sucursal_id", None):
        return qs.filter(venta__turno__terminal__sucursal_id=user.sucursal_id)
    return qs


def pares_vendidos(request, desde, hasta):
    """Pares (producto, sucursal) con venta POS en el rango."""
    inicio, fin = ventana_aware(desde, hasta)
    return {
        (item["producto_id"], item["sucursal_id"])
        for item in _detalle_ventas(request)
        .filter(venta__fecha_hora__gte=inicio, venta__fecha_hora__lte=fin)
        .values("producto_id", sucursal_id=SUCURSAL_VENTA)
        .distinct()
    }


def ultimas_ventas(request):
    """Última venta POS por producto/sucursal (histórico)."""
    return {
        (item["producto_id"], item["sucursal_id"]): item["ultima"]
        for item in _detalle_ventas(request)
        .values("producto_id", sucursal_id=SUCURSAL_VENTA)
        .annotate(ultima=Max("venta__fecha_hora"))
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
        desde, hasta = rango_fechas(
            request.query_params,
            date.today() - timedelta(days=DIAS_MERMAS),
        )
        inicio, fin = ventana_aware(desde, hasta)
        registros = limitar_a_sucursal(
            RegistroMerma.objects.select_related(*RELACIONES, "usuario").filter(
                fecha__gte=inicio,
                fecha__lte=fin,
            ),
            request.user,
            request.query_params.get("sucursal") or None,
        ).order_by("-fecha")
        return self.respuesta(reportes.mermas(registros, desde, hasta))

    @action(detail=False, methods=["get"], url_path="stock-muerto")
    def stock_muerto(self, request):
        hoy = date.today()
        desde, hasta = rango_fechas(request.query_params, hoy.replace(day=1))
        return self.respuesta(
            reportes.stock_muerto(
                self.stock(),
                pares_vendidos(request, desde, hasta),
                ultimas_ventas(request),
                desde,
                hasta,
            )
        )

    @action(detail=False, methods=["get"], url_path="sugerido-compras")
    def sugerido_compras(self, request):
        return self.respuesta(reportes.sugerido_compras(self.stock()))
