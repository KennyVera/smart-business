from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.pos.permisos import es_gerente, nombre_rol

from .models import HistorialReporteIA
from .permisos import PuedeUsarReportesIA
from .serializers import (
    HistorialReporteIAListSerializer,
    HistorialReporteIASerializer,
)
from .services.gemini_sql import ejecutar_select, generar_sql_con_gemini
from .services.pdf import respuesta_pdf
from .services.validacion_ambito import exigir_ambito_negocio


class ReporteInteligenteSerializer(serializers.Serializer):
    prompt_usuario = serializers.CharField(min_length=5, max_length=500)


class ReporteInteligenteAPIView(APIView):
    """Text-to-SQL con Gemini: solo ADMIN / GERENTE; solo SELECT."""

    permission_classes = [PuedeUsarReportesIA]

    def post(self, request):
        serializer = ReporteInteligenteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        prompt = exigir_ambito_negocio(serializer.validated_data["prompt_usuario"])
        contexto = self._contexto_usuario(request.user)
        sql = generar_sql_con_gemini(prompt, contexto_extra=contexto)
        columnas, datos = ejecutar_select(sql)
        registro = HistorialReporteIA.objects.create(
            usuario=request.user,
            prompt_usuario=prompt,
            sql_generado=sql,
            datos_json={"columnas": columnas, "datos": datos},
        )
        return Response(
            {
                "id": registro.pk,
                "columnas": columnas,
                "datos": datos,
                "sql": sql,
                "prompt_usuario": prompt,
                "fecha_creacion": registro.fecha_creacion,
            },
            status=status.HTTP_201_CREATED,
        )

    def _contexto_usuario(self, usuario):
        rol = nombre_rol(usuario)
        if es_gerente(usuario) and usuario.sucursal_id:
            nombre = getattr(usuario.sucursal, "nombre", "") or ""
            return (
                f"Contexto del usuario: es GERENTE de la sucursal "
                f"id_sucursal={usuario.sucursal_id} ({nombre}). "
                "Cuando el reporte hable de ventas o stock de 'mi sucursal', "
                "filtra por esa sucursal."
            )
        if rol == "administrador":
            return (
                "Contexto del usuario: es ADMINISTRADOR "
                "(puede ver todas las sucursales)."
            )
        return ""


class HistorialReporteIAViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Historial del usuario autenticado: listar, ver detalle y eliminar."""

    permission_classes = [PuedeUsarReportesIA]
    http_method_names = ["get", "delete", "head", "options"]

    def get_queryset(self):
        return HistorialReporteIA.objects.filter(usuario=self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return HistorialReporteIAListSerializer
        return HistorialReporteIASerializer

    @action(detail=True, methods=["get"], url_path="pdf")
    def pdf(self, request, pk=None):
        reporte = self.get_object()
        try:
            return respuesta_pdf(reporte, usuario=request.user)
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
