from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models_preferencias import PreferenciaUsuario
from .serializers_preferencias import PreferenciaSerializer


class PreferenciasMeView(APIView):
    """GET/PATCH de preferencias del usuario autenticado (sin ID en URL)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs, _ = PreferenciaUsuario.objects.get_or_create(usuario=request.user)
        return Response(PreferenciaSerializer(prefs, context={"request": request}).data)

    def patch(self, request):
        prefs, _ = PreferenciaUsuario.objects.get_or_create(usuario=request.user)
        serializer = PreferenciaSerializer(
            prefs,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Releer de BD para devolver el valor persistido (no solo el del serializer).
        prefs.refresh_from_db()
        return Response(PreferenciaSerializer(prefs, context={"request": request}).data)
