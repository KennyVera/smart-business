from django.utils import timezone

from apps.usuarios.models import SesionUsuario


def ip_de(request):
    reenviada = request.META.get("HTTP_X_FORWARDED_FOR")
    if reenviada:
        return reenviada.split(",")[0].strip()[:45]
    return request.META.get("REMOTE_ADDR")


def agente_de(request):
    return (request.META.get("HTTP_USER_AGENT") or "")[:255]


def abrir_sesion(usuario, request, jti):
    return SesionUsuario.objects.create(
        usuario=usuario,
        token_sesion=jti,
        ip_address=ip_de(request),
        user_agent=agente_de(request),
        is_active=True,
    )


def cerrar_sesion(sesion):
    if not sesion.is_active:
        return sesion
    sesion.is_active = False
    sesion.fecha_fin = timezone.now()
    sesion.save(update_fields=["is_active", "fecha_fin"])
    return sesion


def cerrar_sesiones_de(usuario):
    abiertas = SesionUsuario.objects.filter(usuario=usuario, is_active=True)
    for sesion in abiertas:
        cerrar_sesion(sesion)


def jti_en_lista_negra(jti):
    return not SesionUsuario.objects.filter(
        token_sesion=jti,
        is_active=True,
    ).exists()
