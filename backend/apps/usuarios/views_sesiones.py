from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.paginacion import entero, pagina_manual, tamano_pedido

from .models import SesionUsuario, Usuario
from .serializers_sesion import SesionUsuarioSerializer
from .signals import sesion_cerrada


class SesionesUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not Usuario.objects.filter(pk=pk).exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        sesiones = SesionUsuario.objects.filter(usuario_id=pk).order_by("-fecha_inicio")
        if request.query_params.get("activas") in ("1", "true", "True"):
            sesiones = sesiones.filter(is_active=True)
        return Response(
            pagina_manual(
                sesiones,
                entero(request.query_params.get("page"), 1),
                tamano_pedido(request),
                SesionUsuarioSerializer,
            )
        )


class RevocarSesionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        sesion = SesionUsuario.objects.filter(pk=pk).first()
        if sesion is None:
            return Response(
                {"detail": "Sesión no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        sesion_cerrada.send(sender=self.__class__, sesion=sesion)
        sesion.refresh_from_db()
        return Response(SesionUsuarioSerializer(sesion).data)


class ResumenSesionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "total": SesionUsuario.objects.count(),
                "activas": SesionUsuario.objects.filter(is_active=True).count(),
            }
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sesion = request.auth
        if isinstance(sesion, SesionUsuario):
            sesion_cerrada.send(sender=self.__class__, sesion=sesion)
        return Response({"detail": "Sesión cerrada."})
