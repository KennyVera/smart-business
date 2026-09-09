from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .permisos import EsGerenteSucursal
from .services.reportes_admin import dashboard_global


class AdminDashboardViewSet(ViewSet):
    """Dashboard global: ventas, categorías y sucursales para el administrador."""

    permission_classes = [EsGerenteSucursal]

    def list(self, request):
        return Response(dashboard_global())
