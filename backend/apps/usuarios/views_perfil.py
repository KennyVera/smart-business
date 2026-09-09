from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers_perfil import CambiarClaveSerializer, PerfilSerializer


class PerfilMeView(APIView):
    """Perfil del usuario autenticado: lectura y edición personal."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(PerfilSerializer(request.user).data)

    def patch(self, request):
        serializer = PerfilSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CambiarClaveView(APIView):
    """Cambia password_hash validando la clave actual (texto plano del ERP)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CambiarClaveSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        usuario = request.user
        usuario.password_hash = serializer.validated_data["new_password"]
        usuario.save(update_fields=["password_hash"])
        return Response({"detail": "Clave actualizada."}, status=status.HTTP_200_OK)
