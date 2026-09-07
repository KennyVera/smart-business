from datetime import date, timedelta

from django.db.models import F
from rest_framework.response import Response
from rest_framework.views import APIView

from core.paginacion import pagina_manual, tamano_pedido

from .models import InventarioStock, LoteCaducidad
from .permisos import PuedeGestionarInventario, limitar_a_sucursal
from .serializers_stock import LoteSerializer, StockSerializer

DIAS_ALERTA = 30
RELACIONES = ("producto", "producto__categoria", "sucursal")


def entero(valor, defecto):
    try:
        return max(int(valor), 0)
    except (TypeError, ValueError):
        return defecto


class AlertasInventarioView(APIView):
    permission_classes = [PuedeGestionarInventario]

    def get(self, request):
        solicitada = request.query_params.get("sucursal") or None
        dias = entero(request.query_params.get("dias"), DIAS_ALERTA)
        limite = date.today() + timedelta(days=dias)

        criticos = limitar_a_sucursal(
            InventarioStock.objects.select_related(*RELACIONES).filter(
                cantidad_actual__lte=F("stock_minimo")
            ),
            request.user,
            solicitada,
        ).order_by("cantidad_actual", "producto__nombre")

        lotes = limitar_a_sucursal(
            LoteCaducidad.objects.select_related(*RELACIONES).filter(
                fecha_vencimiento__lte=limite,
                cantidad__gt=0,
            ),
            request.user,
            solicitada,
        ).order_by("fecha_vencimiento")

        # Cada tarjeta pagina por su cuenta, por eso lleva su propio número de página.
        tamano = tamano_pedido(request)
        return Response(
            {
                "dias": dias,
                "stock_critico": pagina_manual(
                    criticos,
                    entero(request.query_params.get("pagina_critico"), 1),
                    tamano,
                    StockSerializer,
                ),
                "por_caducar": pagina_manual(
                    lotes,
                    entero(request.query_params.get("pagina_caducar"), 1),
                    tamano,
                    LoteSerializer,
                ),
                "resumen": {
                    "criticos": criticos.count(),
                    "por_caducar": lotes.count(),
                    "vencidos": lotes.filter(
                        fecha_vencimiento__lt=date.today()
                    ).count(),
                },
            }
        )
