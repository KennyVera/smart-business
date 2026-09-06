from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .jwt_tokens import emitir_jwt
from .models import Usuario
from .serializers import LoginSerializer
from .serializers_usuario import UsuarioSerializer
from .signals import sesion_iniciada


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data["usuario"].strip()
        clave = serializer.validated_data["clave"]
        cuenta = (
            Usuario.objects.select_related("rol", "sucursal")
            .filter(estado_activo=True, username__iexact=usuario)
            .first()
        )
        if cuenta is None or cuenta.password_hash != clave:
            return Response(
                {"detail": "Usuario o contraseña incorrectos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        token, jti = emitir_jwt(cuenta)
        sesion_iniciada.send(
            sender=self.__class__,
            usuario=cuenta,
            request=request,
            jti=jti,
        )
        data = UsuarioSerializer(cuenta).data
        data["access_token"] = token
        return Response(data)
