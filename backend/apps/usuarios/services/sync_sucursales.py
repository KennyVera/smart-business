from datetime import date

from apps.geografia.models import Sucursal as GeoSucursal
from apps.usuarios.models import SucursalExistente
from apps.usuarios.models_geo import CantonExistente, SubzonaExistente, ZonaExistente


def _zona(geo_zona):
    zona, _ = ZonaExistente.objects.get_or_create(nombre=geo_zona.nombre)
    return zona


def _provincia(geo_provincia):
    """Sincroniza provincia geo → tabla legacy `subzona`."""
    zona = _zona(geo_provincia.zona)
    hallada = SubzonaExistente.objects.filter(
        nombre=geo_provincia.nombre,
        zona=zona,
    ).first()
    if hallada:
        return hallada
    return SubzonaExistente.objects.create(nombre=geo_provincia.nombre, zona=zona)


def _canton(geo_canton):
    provincia = _provincia(geo_canton.provincia)
    hallado = CantonExistente.objects.filter(
        nombre=geo_canton.nombre,
        subzona=provincia,
    ).first()
    if hallado:
        return hallado
    return CantonExistente.objects.create(nombre=geo_canton.nombre, subzona=provincia)


def sincronizar_sucursal(geo):
    canton = _canton(geo.canton)
    campos = {
        "id_canton": canton.id_canton,
        "direccion": geo.direccion or "—",
        "fecha_apertura": geo.fecha_apertura or date.today(),
        "fecha_cierre": geo.fecha_cierre,
        "estado_activa": geo.activa,
    }
    actual = SucursalExistente.objects.filter(nombre=geo.nombre).first()
    if actual:
        for clave, valor in campos.items():
            setattr(actual, clave, valor)
        actual.save()
        return actual
    return SucursalExistente.objects.create(nombre=geo.nombre, **campos)


def sincronizar_todas():
    consulta = GeoSucursal.objects.select_related(
        "canton",
        "canton__provincia",
        "canton__provincia__zona",
    )
    return [sincronizar_sucursal(item) for item in consulta]
