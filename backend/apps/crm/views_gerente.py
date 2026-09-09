from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Max, Q, Sum
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.pos.models import Venta, VentaDetalle
from apps.pos.permisos import EsGerenteSucursal
from apps.pos.services.reportes_gerente import _sucursal_id
from core.paginacion import PaginacionEstandar

from .models import Cliente
from .serializers import (
    ClienteGerenteDetalleSerializer,
    ClienteGerenteListSerializer,
    ClienteGerenteUpdateSerializer,
)

DINERO = DecimalField(max_digits=12, decimal_places=2)
TOTAL_LINEA = ExpressionWrapper(
    F("cantidad") * F("precio_unitario_historico"),
    output_field=DINERO,
)
VIP_GASTO = Decimal("500.00")
VIP_VISITAS = 10


def _local(dt):
    if dt is None:
        return None
    if timezone.is_naive(dt):
        return timezone.make_aware(dt, timezone.get_current_timezone())
    return timezone.localtime(dt)


def _filtro_ventas_sucursal(sucursal_id):
    return Q(
        ventas__anulada=False,
        ventas__turno__terminal__sucursal_id=sucursal_id,
    )


def clientes_con_metricas(sucursal_id):
    filtro = _filtro_ventas_sucursal(sucursal_id)
    return Cliente.objects.annotate(
        total_gastado=Coalesce(
            Sum("ventas__total_factura", filter=filtro),
            Decimal("0.00"),
            output_field=DINERO,
        ),
        frecuencia_visitas=Count("ventas", filter=filtro, distinct=True),
        ultima_compra=Max("ventas__fecha_hora", filter=filtro),
    )


class GerenteClienteViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """CRM analitico: metricas de clientes filtradas por sucursal del gerente."""

    permission_classes = [EsGerenteSucursal]
    pagination_class = PaginacionEstandar
    lookup_value_regex = r"[0-9]+"
    http_method_names = ["get", "patch", "head", "options"]

    def get_sucursal_id(self):
        return _sucursal_id(self.request.user)

    def get_queryset(self):
        sucursal_id = self.get_sucursal_id()
        qs = clientes_con_metricas(sucursal_id)
        if self.action in ("retrieve", "partial_update", "update"):
            return qs
        busqueda = (self.request.query_params.get("q") or "").strip()
        if busqueda:
            qs = qs.filter(
                Q(nombres__icontains=busqueda)
                | Q(apellidos__icontains=busqueda)
                | Q(cedula_ruc__icontains=busqueda)
            )
        else:
            qs = qs.filter(frecuencia_visitas__gt=0)
        return qs.order_by("-total_gastado", "apellidos", "nombres")

    def get_serializer_class(self):
        if self.action in ("partial_update", "update"):
            return ClienteGerenteUpdateSerializer
        if self.action == "retrieve":
            return ClienteGerenteDetalleSerializer
        return ClienteGerenteListSerializer

    def retrieve(self, request, *args, **kwargs):
        cliente = self.get_object()
        sucursal_id = self.get_sucursal_id()
        data = ClienteGerenteDetalleSerializer(cliente).data
        data.update(self._detalle_360(cliente, sucursal_id))
        return Response(data)

    def partial_update(self, request, *args, **kwargs):
        cliente = self.get_object()
        serializer = ClienteGerenteUpdateSerializer(
            cliente,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        enriquecido = clientes_con_metricas(self.get_sucursal_id()).get(pk=cliente.pk)
        data = ClienteGerenteDetalleSerializer(enriquecido).data
        data.update(self._detalle_360(enriquecido, self.get_sucursal_id()))
        return Response(data)

    @action(detail=False, methods=["get"], url_path="exportar")
    def exportar(self, request):
        filas = self.filter_queryset(self.get_queryset())
        lineas = [
            "cedula_ruc,nombres,apellidos,telefono,correo,fecha_nacimiento,"
            "frecuencia_visitas,total_gastado,ultima_compra,vip"
        ]
        for cliente in filas:
            vip = (
                (cliente.total_gastado or 0) >= VIP_GASTO
                or (cliente.frecuencia_visitas or 0) >= VIP_VISITAS
            )
            ultima = (
                _local(cliente.ultima_compra).isoformat()
                if cliente.ultima_compra
                else ""
            )
            nacimiento = (
                cliente.fecha_nacimiento.isoformat()
                if cliente.fecha_nacimiento
                else ""
            )
            lineas.append(
                ",".join(
                    [
                        self._csv(cliente.cedula_ruc),
                        self._csv(cliente.nombres),
                        self._csv(cliente.apellidos),
                        self._csv(cliente.telefono),
                        self._csv(cliente.correo),
                        self._csv(nacimiento),
                        str(cliente.frecuencia_visitas or 0),
                        f"{cliente.total_gastado or 0:.2f}",
                        self._csv(ultima),
                        "SI" if vip else "NO",
                    ]
                )
            )
        contenido = "\ufeff" + "\n".join(lineas) + "\n"
        response = HttpResponse(contenido, content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = (
            'attachment; filename="clientes_sucursal.csv"'
        )
        return response

    def _detalle_360(self, cliente, sucursal_id):
        ventas_ids = list(
            Venta.objects.filter(
                cliente_id=cliente.pk,
                anulada=False,
                turno__terminal__sucursal_id=sucursal_id,
            )
            .order_by("-fecha_hora", "-id_venta")
            .values_list("id_venta", flat=True)
        )

        top = list(
            VentaDetalle.objects.filter(venta_id__in=ventas_ids)
            .values(nombre=F("producto__nombre"))
            .annotate(
                unidades=Coalesce(Sum("cantidad"), 0),
                total=Coalesce(Sum(TOTAL_LINEA), Decimal("0.00")),
            )
            .order_by("-unidades", "-total")[:3]
        )

        visitas = int(getattr(cliente, "frecuencia_visitas", 0) or 0)
        gastado = getattr(cliente, "total_gastado", None) or Decimal("0.00")
        ticket_promedio = (
            (gastado / visitas).quantize(Decimal("0.01"))
            if visitas
            else Decimal("0.00")
        )

        recientes = Venta.objects.filter(id_venta__in=ventas_ids[:5]).order_by(
            "-fecha_hora", "-id_venta"
        )
        historial = [
            {
                "id_venta": venta.id_venta,
                "fecha_hora": _local(venta.fecha_hora).isoformat()
                if venta.fecha_hora
                else None,
                "total_factura": venta.total_factura,
            }
            for venta in recientes
        ]

        return {
            "top_productos": top,
            "ticket_promedio": ticket_promedio,
            "historial": historial,
            "es_vip": gastado >= VIP_GASTO or visitas >= VIP_VISITAS,
        }

    @staticmethod
    def _csv(valor):
        texto = "" if valor is None else str(valor)
        if any(c in texto for c in ',;"\n'):
            return '"' + texto.replace('"', '""') + '"'
        return texto
