from datetime import date

from django.core.management.base import BaseCommand

from apps.geografia.data import CANTONES, SUBZONAS, SUCURSALES, ZONAS
from apps.geografia.models import CantonDistrito, Subzona, Sucursal, ZonaPlanificacion


class Command(BaseCommand):
    help = "Inserta las 9 Zonas de Planificación de Ecuador, cantones y sucursales."

    def handle(self, *args, **options):
        zonas = self._seed_zonas()
        subzonas = self._seed_subzonas(zonas)
        cantones = self._seed_cantones(subzonas)
        sucursales = self._seed_sucursales(cantones)
        self.stdout.write(
            self.style.SUCCESS(
                f"Geografía lista: {zonas} zonas, {subzonas} subzonas, "
                f"{cantones} cantones, {sucursales} sucursales."
            )
        )

    def _seed_zonas(self):
        for id_nombre, codigo, nombre, descripcion in ZONAS:
            ZonaPlanificacion.objects.update_or_create(
                id_nombre=id_nombre,
                defaults={
                    "codigo": codigo,
                    "nombre": nombre,
                    "descripcion": descripcion,
                },
            )
        return len(ZONAS)

    def _seed_subzonas(self, _count):
        for id_nombre, nombre, zona_id in SUBZONAS:
            Subzona.objects.update_or_create(
                id_nombre=id_nombre,
                defaults={"nombre": nombre, "zona_id": zona_id},
            )
        return len(SUBZONAS)

    def _seed_cantones(self, _count):
        for id_nombre, nombre, subzona_id in CANTONES:
            CantonDistrito.objects.update_or_create(
                id_nombre=id_nombre,
                defaults={"nombre": nombre, "subzona_id": subzona_id},
            )
        return len(CANTONES)

    def _seed_sucursales(self, _count):
        for id_nombre, nombre, canton_id, direccion, telefono, apertura in SUCURSALES:
            Sucursal.objects.update_or_create(
                id_nombre=id_nombre,
                defaults={
                    "nombre": nombre,
                    "canton_id": canton_id,
                    "direccion": direccion,
                    "telefono": telefono,
                    "activa": True,
                    "fecha_apertura": date.fromisoformat(apertura),
                },
            )
        return len(SUCURSALES)
