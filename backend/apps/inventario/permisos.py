from rest_framework.permissions import IsAuthenticated

ROL_ADMIN = "administrador"
ROLES_INVENTARIO = ("administrador", "gerente", "bodeguero")


def nombre_rol(usuario):
    """Normaliza 'Gerente de Sucursal' → 'gerente', etc."""
    crudo = (getattr(getattr(usuario, "rol", None), "nombre", "") or "").strip().lower()
    for clave in ("administrador", "gerente", "cajero", "bodeguero"):
        if clave in crudo:
            return clave
    return crudo


def es_admin(usuario):
    return nombre_rol(usuario) == ROL_ADMIN


def puede_gestionar_inventario(usuario):
    return nombre_rol(usuario) in ROLES_INVENTARIO


def sucursal_asignada(usuario):
    return getattr(usuario, "sucursal_id", None)


def sucursal_visible(usuario, solicitada=None):
    """Sucursal que el usuario puede consultar; None significa "todas"."""
    propia = sucursal_asignada(usuario)
    if propia is not None:
        return propia
    return solicitada


def limitar_a_sucursal(queryset, usuario, solicitada=None):
    sucursal = sucursal_visible(usuario, solicitada)
    if sucursal is None:
        return queryset
    return queryset.filter(sucursal_id=sucursal)


class PuedeGestionarInventario(IsAuthenticated):
    message = "Tu rol no tiene acceso al inventario."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return puede_gestionar_inventario(request.user)
