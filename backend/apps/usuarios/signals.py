from django.dispatch import Signal, receiver
from django.db.models.signals import post_save

from apps.usuarios.models import Usuario
from apps.usuarios.models_preferencias import PreferenciaUsuario
from apps.usuarios.services.sesiones import abrir_sesion, cerrar_sesion

sesion_iniciada = Signal()
sesion_cerrada = Signal()


@receiver(sesion_iniciada)
def registrar_sesion(sender, usuario, request, jti, **kwargs):
    abrir_sesion(usuario, request, jti)


@receiver(sesion_cerrada)
def actualizar_cierre(sender, sesion, **kwargs):
    cerrar_sesion(sesion)


@receiver(post_save, sender=Usuario)
def crear_preferencias(sender, instance, created, **kwargs):
    if created:
        PreferenciaUsuario.objects.get_or_create(usuario=instance)
