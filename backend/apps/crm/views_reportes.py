from rest_framework.response import Response
from rest_framework.views import APIView

from apps.pos.permisos import EsGerenteSucursal

from .services.reporte_clientes import armar_reporte


class ReporteClientesView(APIView):
    """Datos de inteligencia CRM para Ver en pantalla / PDF (html2pdf)."""

    permission_classes = [EsGerenteSucursal]

    def get(self, request):
        tipo = (request.query_params.get("tipo") or "top_gastos").strip()
        limite = request.query_params.get("limite")
        return Response(armar_reporte(request.user, tipo=tipo, limite=limite))
