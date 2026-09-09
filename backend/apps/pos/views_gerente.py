from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .permisos import EsGerenteSucursal
from .serializers_gerente import DesgloseTurnoSerializer, TurnoAuditoriaSerializer
from .services.auditoria_cajas import auditoria_cajas, desglose_turno
from .services.reportes_gerente import (
    cierre_diario,
    dashboard_sucursal,
    marcar_auditado,
)


class GerenteReportesViewSet(ViewSet):
    """Reportes de una sola sucursal: la del gerente autenticado."""

    permission_classes = [EsGerenteSucursal]

    @action(detail=False, methods=["get"], url_path="auditoria-cajas")
    def auditoria_cajas(self, request):
        turnos = auditoria_cajas(
            request.user,
            request.query_params.get("fecha_inicio"),
            request.query_params.get("fecha_fin"),
        )
        return Response(TurnoAuditoriaSerializer(turnos, many=True).data)

    @action(
        detail=False,
        methods=["get"],
        url_path=r"auditoria-cajas/(?P<turno_id>[^/.]+)/desglose",
    )
    def desglose_turno(self, request, turno_id=None):
        datos = desglose_turno(request.user, turno_id)
        if datos is None:
            return Response(
                {"detail": "Turno no encontrado en tu sucursal."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(DesgloseTurnoSerializer(datos).data)

    @action(
        detail=False,
        methods=["post"],
        url_path=r"auditoria-cajas/(?P<turno_id>[^/.]+)/auditar",
    )
    def auditar_caja(self, request, turno_id=None):
        turno = marcar_auditado(request.user, turno_id)
        if turno is None:
            return Response(
                {"detail": "Turno no encontrado en tu sucursal."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(TurnoAuditoriaSerializer(turno).data)

    @action(detail=False, methods=["get"], url_path="cierre-diario")
    def cierre_diario(self, request):
        return Response(cierre_diario(request.user))

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        return Response(dashboard_sucursal(request.user))
