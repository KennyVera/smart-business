from django.core.management.base import BaseCommand

from apps.pos.data.caja_demo import CLIENTES, METODOS_PAGO
from apps.pos.models import Cliente, MetodoPago, TerminalPOS
from apps.usuarios.models import SucursalExistente


class Command(BaseCommand):
    help = "Prepara el punto de venta: métodos de pago, cajas y clientes demo."

    def add_arguments(self, parser):
        parser.add_argument("--sucursal", type=int, default=None)

    def handle(self, *args, **options):
        metodos = [
            MetodoPago.objects.get_or_create(nombre=nombre)[0]
            for nombre in METODOS_PAGO
        ]
        terminales = [
            self.terminal_de(sucursal)
            for sucursal in self.sucursales(options["sucursal"])
        ]
        clientes = [
            Cliente.objects.get_or_create(
                cedula_ruc=cedula,
                defaults={
                    "nombres": nombres,
                    "apellidos": apellidos,
                    "telefono": telefono,
                },
            )[0]
            for cedula, nombres, apellidos, telefono in CLIENTES
        ]
        self.stdout.write(
            self.style.SUCCESS(
                f"POS listo: {len(metodos)} métodos de pago, "
                f"{len(terminales)} terminales, {len(clientes)} clientes."
            )
        )

    def terminal_de(self, sucursal):
        terminal = TerminalPOS.objects.filter(sucursal=sucursal).first()
        if terminal is not None:
            return terminal
        return TerminalPOS.objects.create(
            sucursal=sucursal,
            numero_serie=f"CAJA-{sucursal.pk:02d}-01",
            estado_activo=True,
        )

    def sucursales(self, id_sucursal):
        activas = SucursalExistente.objects.filter(estado_activa=True)
        if id_sucursal:
            return activas.filter(pk=id_sucursal)
        return activas.order_by("id_sucursal")
