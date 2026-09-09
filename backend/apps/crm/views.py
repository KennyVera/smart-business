from django.db import IntegrityError
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response

from apps.pos.permisos import PuedeVender

from .models import Cliente
from .serializers import ClienteSerializer


class ClienteViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Alta exprés y lookup por cédula/RUC para el POS."""

    serializer_class = ClienteSerializer
    permission_classes = [PuedeVender]
    lookup_field = "cedula_ruc"
    lookup_url_kwarg = "cedula"
    queryset = Cliente.objects.all()

    def get_object(self):
        cedula = (self.kwargs.get("cedula") or "").strip()
        if not cedula:
            raise NotFound("Indica la cédula o el RUC del cliente.")
        cliente = (
            Cliente.objects.filter(cedula_ruc=cedula).first()
            or Cliente.objects.filter(cedula_ruc=cedula.zfill(10)).first()
            or Cliente.objects.filter(cedula_ruc=cedula.zfill(13)).first()
        )
        if cliente is None:
            raise NotFound("No hay un cliente afiliado con esa identificación.")
        return cliente

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError as error:
            raise ValidationError(
                {"cedula_ruc": "Ya existe un cliente con esa identificación."}
            ) from error
        return Response(serializer.data, status=status.HTTP_201_CREATED)
