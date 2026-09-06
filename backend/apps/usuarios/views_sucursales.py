from rest_framework import viewsets

from .models import SucursalExistente
from .serializers import SucursalAsignableSerializer
from .services.sync_sucursales import sincronizar_todas


class SucursalAsignableViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SucursalAsignableSerializer

    def get_queryset(self):
        sincronizar_todas()
        return SucursalExistente.objects.filter(estado_activa=True).order_by("nombre")
