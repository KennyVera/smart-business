import os
import random
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q

from apps.inventario.models import Categoria, InventarioStock, Producto
from apps.usuarios.models import SucursalExistente


PRODUCTOS_CUENCA = [
    {
        "sku": "LAC-1001",
        "nombre": "Leche entera DIA Lactea 1 L",
        "precio_venta": Decimal("1.25"),
        "costo": Decimal("0.92"),
        "categoria_nombre": "Lácteos",
        "aplica_iva": False,
        "nombre_archivo_imagen": "DIA LACTEA leche entera Líquida envase 1 lt.jpg",
    },
    {
        "sku": "PAN-1001",
        "nombre": "Pan de caja Bimbo integral 620 g",
        "precio_venta": Decimal("2.10"),
        "costo": Decimal("1.58"),
        "categoria_nombre": "Panadería",
        "aplica_iva": False,
        "nombre_archivo_imagen": "Pan de caja bimbo integral 620 g.jpg",
    },
    {
        "sku": "PAN-1002",
        "nombre": "Almojabanas Pan Pa' Ya 6 pack",
        "precio_venta": Decimal("2.65"),
        "costo": Decimal("1.95"),
        "categoria_nombre": "Panadería",
        "aplica_iva": False,
        "nombre_archivo_imagen": "Pan Pa' Ya Almojábanas 6 pack.jpg",
    },
    {
        "sku": "LAC-1002",
        "nombre": "Queso fresco Garcia Baquero",
        "precio_venta": Decimal("4.85"),
        "costo": Decimal("3.70"),
        "categoria_nombre": "Lácteos",
        "aplica_iva": False,
        "nombre_archivo_imagen": "Fresco Cabra - Garcia Baquero Web.jpg",
    },
    {
        "sku": "LAC-1003",
        "nombre": "Requeson Bionda 500 g",
        "precio_venta": Decimal("3.45"),
        "costo": Decimal("2.40"),
        "categoria_nombre": "Lácteos",
        "aplica_iva": False,
        "nombre_archivo_imagen": "Requesón bionda 500 g.jpg",
    },
    {
        "sku": "ABA-1001",
        "nombre": "Avena familiar 500 g",
        "precio_venta": Decimal("1.80"),
        "costo": Decimal("1.15"),
        "categoria_nombre": "Abarrotes",
        "aplica_iva": False,
        "nombre_archivo_imagen": "AVENA FAMILIAR.jpg",
    },
    {
        "sku": "BEB-1001",
        "nombre": "Coca-Cola Original 3 L",
        "precio_venta": Decimal("2.75"),
        "costo": Decimal("2.05"),
        "categoria_nombre": "Bebidas",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Coca-Cola Original.jpg",
    },
    {
        "sku": "BEB-1002",
        "nombre": "Jugo del Valle Mandarina 500 ml",
        "precio_venta": Decimal("1.20"),
        "costo": Decimal("0.78"),
        "categoria_nombre": "Bebidas",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Jugo del Valle sabor Mandarina 500 ml.jpg",
    },
    {
        "sku": "BEB-1003",
        "nombre": "Bebida energetica Vive 100",
        "precio_venta": Decimal("1.05"),
        "costo": Decimal("0.67"),
        "categoria_nombre": "Bebidas",
        "aplica_iva": True,
        "nombre_archivo_imagen": "VIVE 100.jpg",
    },
    {
        "sku": "LIM-1001",
        "nombre": "Axion lavaplatos limon 425 g",
        "precio_venta": Decimal("2.35"),
        "costo": Decimal("1.62"),
        "categoria_nombre": "Limpieza",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Axion Lavaplatos El Verdadero Arrancagrasa Limon 425g (pack Of 2).jpg",
    },
    {
        "sku": "LIM-1002",
        "nombre": "Cif limpiador acero inoxidable",
        "precio_venta": Decimal("4.25"),
        "costo": Decimal("3.10"),
        "categoria_nombre": "Limpieza",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Cif Stainless Steel Cleaner.jpg",
    },
    {
        "sku": "LIM-1003",
        "nombre": "Clorox limpiador de bano 30 oz",
        "precio_venta": Decimal("4.95"),
        "costo": Decimal("3.75"),
        "categoria_nombre": "Limpieza",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Clorox Disinfecting Bathroom Cleaner Spray - Original - 30 fl oz_ Bleach-Free Liquid, Multipurpose, Multi-Surface.jpg",
    },
    {
        "sku": "LIM-1004",
        "nombre": "Fabuloso multiusos pasion de frutas 2 L",
        "precio_venta": Decimal("3.60"),
        "costo": Decimal("2.55"),
        "categoria_nombre": "Limpieza",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Limpiador multiusos líquido fabuloso pasión de frutas 2 l.jpg",
    },
    {
        "sku": "LIM-1005",
        "nombre": "Cloro Suprema 1 L",
        "precio_venta": Decimal("1.55"),
        "costo": Decimal("0.98"),
        "categoria_nombre": "Limpieza",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Água Sanitária Com Cloro Ativo 1 Litro Suprema.jpg",
    },
    {
        "sku": "DUL-1001",
        "nombre": "Danette dulce de leche",
        "precio_venta": Decimal("1.35"),
        "costo": Decimal("0.88"),
        "categoria_nombre": "Dulces",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Danette dulce de leche.jpg",
    },
    {
        "sku": "SNK-1001",
        "nombre": "Galletas Emperador",
        "precio_venta": Decimal("0.85"),
        "costo": Decimal("0.48"),
        "categoria_nombre": "Snacks",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Galletas Emperador Guatemala.jpg",
    },
    {
        "sku": "DUL-1002",
        "nombre": "Yogurisimo Rocklets",
        "precio_venta": Decimal("1.45"),
        "costo": Decimal("0.94"),
        "categoria_nombre": "Dulces",
        "aplica_iva": True,
        "nombre_archivo_imagen": "Yogurisimo rocklets.jpg",
    },
]


class Command(BaseCommand):
    help = "Puebla productos e inventario inicial para la sucursal Cuenca Centro."

    def handle(self, *args, **options):
        sucursal = self.obtener_sucursal_cuenca()
        carpeta_imagenes = self.obtener_carpeta_imagenes()

        if carpeta_imagenes is None:
            self.stdout.write(
                self.style.WARNING(
                    "No se encontro la carpeta ImagenesProductos. Se crearan productos sin imagen cuando aplique."
                )
            )

        creados = 0
        existentes = 0

        for item in PRODUCTOS_CUENCA:
            categoria, _ = Categoria.objects.get_or_create(
                nombre=item["categoria_nombre"]
            )

            producto = Producto.objects.filter(
                Q(sku=item["sku"]) | Q(nombre=item["nombre"])
            ).first()

            if producto:
                existentes += 1
                producto.nombre = item["nombre"]
                producto.categoria = categoria
                producto.costo_actual = item["costo"]
                producto.precio_venta = item["precio_venta"]
                producto.aplica_iva = item["aplica_iva"]
                producto.save(
                    update_fields=[
                        "nombre",
                        "categoria",
                        "costo_actual",
                        "precio_venta",
                        "aplica_iva",
                    ]
                )
                if not producto.imagen:
                    self.asignar_imagen_si_existe(producto, carpeta_imagenes, item)
            else:
                producto = Producto(
                    sku=item["sku"],
                    nombre=item["nombre"],
                    categoria=categoria,
                    costo_actual=item["costo"],
                    precio_venta=item["precio_venta"],
                    aplica_iva=item["aplica_iva"],
                )
                producto.save()
                creados += 1

                self.asignar_imagen_si_existe(producto, carpeta_imagenes, item)

            stock_inicial = random.randint(50, 200)
            stock_obj, stock_creado = InventarioStock.objects.get_or_create(
                sucursal=sucursal,
                producto=producto,
                defaults={
                    "cantidad_actual": stock_inicial,
                    "stock_minimo": 10,
                },
            )

            if not stock_creado:
                stock_obj.cantidad_actual = stock_inicial
                stock_obj.stock_minimo = 10
                stock_obj.save(update_fields=["cantidad_actual", "stock_minimo"])

            self.stdout.write(
                self.style.SUCCESS(
                    f"Producto listo: {producto.nombre} | stock={stock_obj.cantidad_actual} | sucursal={sucursal.nombre}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeding completado en {sucursal.nombre}. Productos nuevos: {creados}. Productos ya existentes: {existentes}."
            )
        )

    def obtener_sucursal_cuenca(self):
        sucursal = SucursalExistente.objects.filter(nombre__iexact="Cuenca Centro").first()
        if not sucursal:
            raise CommandError('La sucursal "Cuenca Centro" no existe.')
        return sucursal

    def obtener_carpeta_imagenes(self):
        candidatos = [
            Path(settings.BASE_DIR).parent / "ImagenesProductos",
            Path(settings.BASE_DIR) / "ImagenesProductos",
        ]
        for carpeta in candidatos:
            if carpeta.is_dir() and any(carpeta.iterdir()):
                return carpeta
        return None

    def asignar_imagen_si_existe(self, producto, carpeta_imagenes, item):
        if carpeta_imagenes is None:
            return

        ruta_imagen = os.path.join(
            str(carpeta_imagenes),
            item["nombre_archivo_imagen"],
        )

        try:
            if os.path.exists(ruta_imagen):
                with open(ruta_imagen, "rb") as imagen_file:
                    producto.imagen.save(
                        os.path.basename(ruta_imagen),
                        File(imagen_file),
                        save=True,
                    )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"No se encontro la imagen para {producto.nombre}: {ruta_imagen}"
                    )
                )
        except OSError as exc:
            self.stdout.write(
                self.style.WARNING(
                    f"No se pudo cargar la imagen de {producto.nombre}: {exc}"
                )
            )
