from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notificacion
from .serializers_notificacion import NotificacionSerializer


class NotificacionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Notificacion.objects.filter(usuario=request.user).order_by(
            "-fecha_creacion",
            "-id_notificacion",
        )[:30]
        return Response(NotificacionSerializer(items, many=True).data)


class NotificacionLeerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        nota = Notificacion.objects.filter(pk=pk, usuario=request.user).first()
        if nota is None:
            return Response(
                {"detail": "Notificación no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not nota.leida:
            nota.leida = True
            nota.save(update_fields=["leida"])
        return Response(NotificacionSerializer(nota).data)
