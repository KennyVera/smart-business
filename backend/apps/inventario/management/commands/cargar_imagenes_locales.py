import re
import unicodedata
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from apps.inventario.models import Producto

EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Descargas cuyo nombre no coincide con el SKU ni con el nombre del catálogo.
ARCHIVOS_SKU = {
    "descarga (1).jpg": "ABA-0002",
    "descarga (2).jpg": "BEB-0002",
    "descarga (3).jpg": "LAC-0003",
    "mercado libre.jpg": "LIM-0001",
    "mercado livre brasil.jpg": "ABA-0001",
    "google image result for https___licoresbrisol_com.pe_web_webimg_1603_1_1000.png": "BEB-0001",
}

CLAVES = (
    ("cloro", "LIM-0002"),
    ("sanitaria", "LIM-0002"),
    ("requeson", "LAC-0001"),
    ("bionda", "LAC-0001"),
    ("cabra", "LAC-0004"),
    ("baquero", "LAC-0004"),
    ("queso", "LAC-0004"),
    ("leche", "LAC-0002"),
    ("lactea", "LAC-0002"),
    ("integral", "PAN-0002"),
    ("bimbo", "PAN-0002"),
    ("almojaban", "PAN-0001"),
    ("yema", "PAN-0001"),
    ("girasol", "ABA-0002"),
    ("aceite", "ABA-0002"),
    ("yoplait", "LAC-0003"),
    ("griego", "LAC-0003"),
    ("yogur", "LAC-0003"),
    ("detergente", "LIM-0001"),
    ("arroz", "ABA-0001"),
    ("cielo", "BEB-0001"),
    ("coca", "BEB-0002"),
)


def normalizar(texto):
    plano = unicodedata.normalize("NFKD", texto or "")
    plano = "".join(caracter for caracter in plano if not unicodedata.combining(caracter))
    return re.sub(r"[^a-z0-9]+", " ", plano.lower()).strip()


def carpeta_origen():
    candidatos = [
        settings.BASE_DIR.parent / "ImagenesProductos",
        settings.BASE_DIR / "ImagenesProductos",
        Path("/app/ImagenesProductos"),
    ]
    for carpeta in candidatos:
        if carpeta.is_dir():
            return carpeta
    return None


class Command(BaseCommand):
    help = "Asigna las fotos de ImagenesProductos al ImageField de cada producto."

    def handle(self, *args, **options):
        carpeta = carpeta_origen()
        if carpeta is None:
            self.stderr.write("No encontré la carpeta ImagenesProductos.")
            return

        archivos = [
            ruta
            for ruta in carpeta.iterdir()
            if ruta.is_file() and ruta.suffix.lower() in EXTENSIONES
        ]
        productos = list(Producto.objects.all())
        if not archivos or not productos:
            self.stdout.write("No hay archivos o productos para emparejar.")
            return

        asignados = {}
        usados = set()
        for archivo in archivos:
            mejor = None
            mejor_puntaje = 0
            for producto in productos:
                if producto.sku in usados:
                    continue
                puntaje = self.puntuar(archivo, producto)
                if puntaje > mejor_puntaje:
                    mejor = producto
                    mejor_puntaje = puntaje
            if mejor is None or mejor_puntaje < 5:
                self.stdout.write(self.style.WARNING(f"Sin match: {archivo.name}"))
                continue
            asignados[mejor.sku] = archivo
            usados.add(mejor.sku)

        for producto in productos:
            archivo = asignados.get(producto.sku)
            if archivo is None:
                self.stdout.write(self.style.WARNING(f"Sin imagen: {producto.sku} {producto.nombre}"))
                continue
            with archivo.open("rb") as origen:
                nombre = f"{producto.sku}{archivo.suffix.lower()}"
                producto.imagen.save(nombre, File(origen), save=True)
            self.stdout.write(
                self.style.SUCCESS(f"{producto.sku} ← {archivo.name}")
            )

    def puntuar(self, archivo, producto):
        nombre = archivo.name.lower()
        if producto.sku.lower() in nombre.replace(" ", ""):
            return 100
        if ARCHIVOS_SKU.get(nombre) == producto.sku:
            return 90
        archivo_n = normalizar(archivo.stem)
        producto_n = normalizar(f"{producto.sku} {producto.nombre}")
        puntos = 0
        for token in archivo_n.split():
            if len(token) >= 4 and token in producto_n:
                puntos += 4
        for texto, sku in CLAVES:
            if texto in archivo_n and sku == producto.sku:
                puntos += 12
        return puntos
