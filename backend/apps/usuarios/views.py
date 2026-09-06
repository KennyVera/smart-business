from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Rol, Usuario
from .serializers import RolSerializer
from .serializers_usuario import UsuarioSerializer
from .services.clave_temporal import generar_clave_temporal
from .services.sesiones import cerrar_sesiones_de

ROL_ADMIN = "administrador"


class RolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related("rol", "sucursal")
    serializer_class = UsuarioSerializer
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        usuario = self.get_object()
        if not usuario.estado_activo:
            return Response(self.get_serializer(usuario).data)
        if usuario.rol.nombre.strip().lower() == ROL_ADMIN:
            vivos = Usuario.objects.filter(
                estado_activo=True,
                rol__nombre__iexact="Administrador",
            ).count()
            if vivos <= 1:
                return Response(
                    {"detail": "No se puede desactivar al último administrador."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        usuario.estado_activo = False
        usuario.save(update_fields=["estado_activo"])
        cerrar_sesiones_de(usuario)
        return Response(self.get_serializer(usuario).data)

    @action(detail=True, methods=["post"], url_path="restablecer-clave")
    def restablecer_clave(self, request, pk=None):
        usuario = self.get_object()
        if not usuario.estado_activo:
            return Response(
                {"detail": "El usuario está inactivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        clave = generar_clave_temporal()
        usuario.password_hash = clave
        usuario.save(update_fields=["password_hash"])
        return Response(
            {
                "id_usuario": usuario.id_usuario,
                "username": usuario.username,
                "clave_temporal": clave,
            }
        )
