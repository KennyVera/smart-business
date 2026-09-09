from datetime import timezone as zona_utc

from django.utils import timezone


def con_zona(valor):
    """Las tablas heredadas guardan la hora en UTC sin zona declarada."""
    if valor is None:
        return None
    if timezone.is_naive(valor):
        valor = valor.replace(tzinfo=zona_utc.utc)
    return timezone.localtime(valor)
