import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .jwt_tokens import decodificar_jwt
from .models import SesionUsuario, Usuario
from .services.sesiones import jti_en_lista_negra


class SesionJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.META.get("HTTP_AUTHORIZATION", "")
        if not header.startswith("Bearer "):
            return None
        token = header[7:].strip()
        try:
            payload = decodificar_jwt(token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("La sesión expiró.")
        except jwt.PyJWTError:
            raise AuthenticationFailed("Token de sesión inválido.")
        jti = payload.get("jti")
        if not jti or jti_en_lista_negra(jti):
            raise AuthenticationFailed("La sesión fue cerrada.")
        usuario = Usuario.objects.filter(
            pk=payload.get("uid"),
            estado_activo=True,
        ).first()
        if usuario is None:
            raise AuthenticationFailed("Usuario inactivo.")
        sesion = SesionUsuario.objects.filter(token_sesion=jti, is_active=True).first()
        return (usuario, sesion)
