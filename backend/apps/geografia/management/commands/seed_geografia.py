from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Alias de seed_division_politica (zonas, provincias, cantones y sucursales demo)."

    def handle(self, *args, **options):
        call_command("seed_division_politica", con_sucursales=True)
