from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MetodoPago
from .permisos import PuedeVender
from .serializers import (
    AbrirTurnoSerializer,
    CerrarTurnoSerializer,
    MetodoPagoSerializer,
    TerminalSerializer,
    TurnoSerializer,
)
from .services.turnos import (
    abrir_turno,
    cerrar_turno,
    resumen_turno,
    terminales_disponibles,
    turno_abierto,
)


class MetodoPagoViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = MetodoPago.objects.all()
    serializer_class = MetodoPagoSerializer
    permission_classes = [PuedeVender]


class TurnoViewSet(viewsets.GenericViewSet):
    """Apertura y cierre de caja: sin turno abierto no se puede cobrar."""

    serializer_class = TurnoSerializer
    permission_classes = [PuedeVender]

    @action(detail=False, methods=["get"])
    def actual(self, request):
        turno = turno_abierto(request.user)
        return Response(
            {
                "turno": TurnoSerializer(turno).data if turno else None,
                "resumen": resumen_turno(turno) if turno else None,
                "terminales": TerminalSerializer(
                    terminales_disponibles(request.user),
                    many=True,
                ).data,
            }
        )

    @action(detail=False, methods=["post"])
    def abrir(self, request):
        datos = AbrirTurnoSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        turno = abrir_turno(
            request.user,
            datos.validated_data.get("terminal"),
            datos.validated_data["monto_apertura"],
        )
        return Response(
            {"turno": TurnoSerializer(turno).data, "resumen": resumen_turno(turno)}
        )

    @action(detail=False, methods=["post"])
    def cerrar(self, request):
        datos = CerrarTurnoSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        turno = turno_abierto(request.user)
        if turno is None:
            return Response({"detail": "No tienes un turno abierto."}, status=400)
        resumen = resumen_turno(turno)
        cerrado = cerrar_turno(turno, datos.validated_data["monto_cierre_declarado"])
        resumen["diferencia"] = round(
            cerrado.monto_cierre_declarado - resumen["efectivo_esperado"],
            2,
        )
        return Response(
            {"turno": TurnoSerializer(cerrado).data, "resumen": resumen}
        )
