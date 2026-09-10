from datetime import date

from django.core.management.base import BaseCommand

from apps.geografia.data import CANTONES, PROVINCIAS, SUCURSALES, ZONAS
from apps.geografia.models import Canton, Provincia, Sucursal, ZonaPlanificacion


class Command(BaseCommand):
    help = (
        "Pobla las 9 zonas SENPLADES, provincias y cantones principales "
        "de la división política de Ecuador."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--con-sucursales",
            action="store_true",
            help="También inserta/actualiza las sucursales de demostración.",
        )

    def handle(self, *args, **options):
        zonas = self._seed_zonas()
        provincias = self._seed_provincias()
        cantones = self._seed_cantones()
        mensaje = (
            f"División política lista: {zonas} zonas, "
            f"{provincias} provincias, {cantones} cantones."
        )
        if options["con_sucursales"]:
            sucursales = self._seed_sucursales()
            mensaje += f" Sucursales demo: {sucursales}."
        self.stdout.write(self.style.SUCCESS(mensaje))

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

    def _seed_provincias(self):
        for id_nombre, nombre, zona_id in PROVINCIAS:
            Provincia.objects.update_or_create(
                id_nombre=id_nombre,
                defaults={"nombre": nombre, "zona_id": zona_id},
            )
        return len(PROVINCIAS)

    def _seed_cantones(self):
        for id_nombre, nombre, provincia_id in CANTONES:
            Canton.objects.update_or_create(
                id_nombre=id_nombre,
                defaults={"nombre": nombre, "provincia_id": provincia_id},
            )
        return len(CANTONES)

    def _seed_sucursales(self):
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
