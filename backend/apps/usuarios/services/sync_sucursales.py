from datetime import date

from apps.geografia.models import Sucursal as GeoSucursal
from apps.usuarios.models import SucursalExistente
from apps.usuarios.models_geo import CantonExistente, SubzonaExistente, ZonaExistente


def _zona(geo_zona):
    zona, _ = ZonaExistente.objects.get_or_create(nombre=geo_zona.nombre)
    return zona


def _subzona(geo_subzona):
    zona = _zona(geo_subzona.zona)
    hallada = SubzonaExistente.objects.filter(
        nombre=geo_subzona.nombre,
        zona=zona,
    ).first()
    if hallada:
        return hallada
    return SubzonaExistente.objects.create(nombre=geo_subzona.nombre, zona=zona)


def _canton(geo_canton):
    subzona = _subzona(geo_canton.subzona)
    hallado = CantonExistente.objects.filter(
        nombre=geo_canton.nombre,
        subzona=subzona,
    ).first()
    if hallado:
        return hallado
    return CantonExistente.objects.create(nombre=geo_canton.nombre, subzona=subzona)


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
        "canton__subzona",
        "canton__subzona__zona",
    )
    return [sincronizar_sucursal(item) for item in consulta]
