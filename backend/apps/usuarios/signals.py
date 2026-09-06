from django.dispatch import Signal, receiver

from apps.usuarios.services.sesiones import abrir_sesion, cerrar_sesion

sesion_iniciada = Signal()
sesion_cerrada = Signal()


@receiver(sesion_iniciada)
def registrar_sesion(sender, usuario, request, jti, **kwargs):
    abrir_sesion(usuario, request, jti)


@receiver(sesion_cerrada)
def actualizar_cierre(sender, sesion, **kwargs):
    cerrar_sesion(sesion)
