from rest_framework.permissions import IsAuthenticated

ROL_CAJERO = "cajero"
ROLES_POS = ("cajero", "administrador", "gerente")
ROLES_GERENTE = ("gerente", "administrador")


def nombre_rol(usuario):
    """Normaliza 'Gerente de Sucursal' → 'gerente', etc."""
    crudo = (getattr(getattr(usuario, "rol", None), "nombre", "") or "").strip().lower()
    for clave in ("administrador", "gerente", "cajero", "bodeguero"):
        if clave in crudo:
            return clave
    return crudo


def es_cajero(usuario):
    return nombre_rol(usuario) == ROL_CAJERO


def es_gerente(usuario):
    return nombre_rol(usuario) == "gerente"


def puede_vender(usuario):
    return nombre_rol(usuario) in ROLES_POS


def puede_gerenciar(usuario):
    return nombre_rol(usuario) in ROLES_GERENTE


class PuedeVender(IsAuthenticated):
    message = "Tu rol no tiene acceso al punto de venta."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return puede_vender(request.user)


class EsGerenteSucursal(IsAuthenticated):
    message = "Solo el gerente de sucursal puede ver estos reportes."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if not puede_gerenciar(request.user):
            return False
        if es_gerente(request.user) and not request.user.sucursal_id:
            self.message = "Tu usuario gerente no tiene sucursal asignada."
            return False
        return True
