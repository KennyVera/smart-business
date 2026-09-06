from datetime import date

from django.utils.text import slugify
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.usuarios.services.sync_sucursales import sincronizar_sucursal

from .models import Sucursal
from .serializers import SucursalSerializer
from .services.detalle_sucursal import terminales_de


class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.select_related(
        "canton",
        "canton__subzona",
        "canton__subzona__zona",
    )
    serializer_class = SucursalSerializer
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def perform_create(self, serializer):
        nombre = serializer.validated_data["nombre"]
        base = slugify(nombre) or "sucursal"
        codigo = f"sucursal-{base}"[:64]
        extra = 2
        while Sucursal.objects.filter(pk=codigo).exists():
            codigo = f"sucursal-{base}-{extra}"[:64]
            extra += 1
        sucursal = serializer.save(id_nombre=codigo)
        sincronizar_sucursal(sucursal)

    def perform_update(self, serializer):
        sucursal = serializer.save()
        sincronizar_sucursal(sucursal)

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        sucursal = self.get_object()
        sucursal.activa = False
        sucursal.fecha_cierre = date.today()
        sucursal.save(update_fields=["activa", "fecha_cierre"])
        sincronizar_sucursal(sucursal)
        return Response(self.get_serializer(sucursal).data)

    @action(detail=True, methods=["get"])
    def detalle(self, request, pk=None):
        sucursal = self.get_object()
        usuarios = Usuario.objects.filter(
            sucursal__nombre__iexact=sucursal.nombre,
        ).select_related("rol")
        return Response(
            {
                "sucursal": self.get_serializer(sucursal).data,
                "usuarios": [
                    {
                        "id_usuario": item.id_usuario,
                        "username": item.username,
                        "nombre": f"{item.nombre} {item.apellido}".strip(),
                        "rol": item.rol.nombre,
                    }
                    for item in usuarios
                ],
                "terminales": terminales_de(sucursal.nombre),
            }
        )
