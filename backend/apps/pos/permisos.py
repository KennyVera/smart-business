from rest_framework.permissions import IsAuthenticated

ROL_CAJERO = "cajero"
ROLES_POS = ("cajero", "administrador", "gerente")


def nombre_rol(usuario):
    rol = getattr(usuario, "rol", None)
    return (getattr(rol, "nombre", "") or "").strip().lower()


def es_cajero(usuario):
    return nombre_rol(usuario) == ROL_CAJERO


def puede_vender(usuario):
    return nombre_rol(usuario) in ROLES_POS


class PuedeVender(IsAuthenticated):
    message = "Tu rol no tiene acceso al punto de venta."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return puede_vender(request.user)
