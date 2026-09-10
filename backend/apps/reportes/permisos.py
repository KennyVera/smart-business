from rest_framework.permissions import IsAuthenticated

from apps.pos.permisos import nombre_rol

ROLES_REPORTES_IA = ("administrador", "gerente")


class PuedeUsarReportesIA(IsAuthenticated):
    """Solo Administrador y Gerente pueden ejecutar Text-to-SQL."""

    message = "Solo administradores y gerentes pueden usar reportes con IA."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return nombre_rol(request.user) in ROLES_REPORTES_IA
