from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.inventario.data.catalogo_demo import CATEGORIAS, LOTES, PRODUCTOS, STOCK
from apps.inventario.models import (
    Categoria,
    HistorialMovimiento,
    InventarioStock,
    LoteCaducidad,
    Producto,
)
from apps.inventario.services.kardex import registrar_movimiento
from apps.usuarios.models import SucursalExistente


class Command(BaseCommand):
    help = "Carga catálogo, stock y lotes de demostración para una sucursal."

    def add_arguments(self, parser):
        parser.add_argument("--sucursal", type=int, default=None)

    def handle(self, *args, **options):
        sucursal = self.resolver_sucursal(options["sucursal"])
        categorias = {
            nombre: Categoria.objects.get_or_create(nombre=nombre)[0]
            for nombre in CATEGORIAS
        }
        productos = {}
        for sku, nombre, categoria, costo, precio in PRODUCTOS:
            producto, _ = Producto.objects.update_or_create(
                sku=sku,
                defaults={
                    "nombre": nombre,
                    "categoria": categorias[categoria],
                    "costo_actual": Decimal(costo),
                    "precio_venta": Decimal(precio),
                },
            )
            productos[sku] = producto

        for sku, cantidad, minimo in STOCK:
            producto = productos[sku]
            fila = InventarioStock.objects.filter(sucursal=sucursal, producto=producto)
            if fila.exists():
                fila.update(cantidad_actual=cantidad, stock_minimo=minimo)
            else:
                InventarioStock.objects.create(
                    sucursal=sucursal,
                    producto=producto,
                    cantidad_actual=cantidad,
                    stock_minimo=minimo,
                )
            self.carga_inicial(sucursal, producto, cantidad)

        for sku, codigo, dias, cantidad in LOTES:
            LoteCaducidad.objects.update_or_create(
                sucursal=sucursal,
                producto=productos[sku],
                codigo_lote=codigo,
                defaults={
                    "fecha_vencimiento": date.today() + timedelta(days=dias),
                    "cantidad": cantidad,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Inventario demo cargado en {sucursal.nombre}: "
                f"{len(productos)} productos, {len(LOTES)} lotes."
            )
        )

    def carga_inicial(self, sucursal, producto, cantidad):
        """Deja el kardex con un punto de partida sin duplicarlo al re-sembrar."""
        ya_tiene = HistorialMovimiento.objects.filter(
            sucursal=sucursal,
            producto=producto,
        ).exists()
        if ya_tiene:
            return
        registrar_movimiento(
            sucursal.pk,
            producto.pk,
            HistorialMovimiento.AJUSTE,
            cantidad,
            cantidad,
            referencia="Carga inicial de inventario",
        )

    def resolver_sucursal(self, id_sucursal):
        if id_sucursal:
            return SucursalExistente.objects.get(pk=id_sucursal)
        return SucursalExistente.objects.order_by("id_sucursal").first()
