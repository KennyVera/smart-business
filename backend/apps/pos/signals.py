from decimal import Decimal

from django.db.models import Q
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.usuarios.models import Notificacion, Usuario

from .models import TurnoCaja


def _gerentes_sucursal(sucursal_id):
    return Usuario.objects.filter(
        sucursal_id=sucursal_id,
        estado_activo=True,
    ).filter(
        Q(rol__nombre__iexact="Gerente de Sucursal")
        | Q(rol__nombre__icontains="gerente")
    )


def _mensaje_descuadre(turno):
    monto = abs(turno.descuadre or Decimal("0"))
    tipo = "Faltante" if turno.descuadre < 0 else "Sobrante"
    return (
        f"El cajero {turno.usuario.username} cerró turno con un "
        f"{tipo} de ${monto}."
    )


@receiver(post_save, sender=TurnoCaja)
def notificar_descuadre_cierre(sender, instance, created, **kwargs):
    """Al cerrar con descuadre ≠ 0, avisa a los gerentes de esa sucursal."""
    if created or instance.estado != TurnoCaja.CERRADO:
        return
    if not instance.descuadre or instance.descuadre == 0:
        return
    campos = kwargs.get("update_fields")
    if campos is not None and "estado" not in campos and "fecha_cierre" not in campos:
        return
    sucursal_id = instance.terminal.sucursal_id
    titulo = "Descuadre de caja"
    mensaje = _mensaje_descuadre(instance)
    for gerente in _gerentes_sucursal(sucursal_id):
        Notificacion.objects.create(
            usuario=gerente,
            titulo=titulo,
            mensaje=mensaje,
            tipo=Notificacion.CAJA,
        )
