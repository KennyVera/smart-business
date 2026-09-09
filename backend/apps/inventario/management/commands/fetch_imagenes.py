import time

import requests
from django.core.management.base import BaseCommand
from apps.inventario.models import Producto


class Command(BaseCommand):
    help = "Busca imágenes reales de productos en Open Food Facts"

    def handle(self, *args, **kwargs):
        productos = Producto.objects.all()
        url_api = "https://world.openfoodfacts.org/cgi/search.pl"
        headers = {"User-Agent": "SmartBusiness/1.0 (inventario POS)"}

        for producto in productos:
            self.stdout.write(f"Buscando imagen para: {producto.nombre}...")
            try:
                params = {
                    "search_terms": producto.nombre,
                    "search_simple": 1,
                    "action": "process",
                    "json": 1,
                    "page_size": 1,
                }
                data = self.consultar(url_api, params, headers)

                if data.get("products") and len(data["products"]) > 0:
                    # Intentar obtener la imagen frontal
                    hallado = data["products"][0]
                    img_url = hallado.get("image_front_url") or hallado.get("image_url")

                    if img_url:
                        producto.imagen_url = img_url
                        producto.save(update_fields=["imagen_url"])
                        self.stdout.write(self.style.SUCCESS(f"¡Imagen actualizada!: {img_url}"))
                    else:
                        self.stdout.write(self.style.WARNING("Producto encontrado, pero sin imagen."))
                else:
                    self.stdout.write(self.style.ERROR("No se encontraron resultados."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error con {producto.nombre}: {str(e)}"))
            time.sleep(1.2)

    def consultar(self, url_api, params, headers):
        ultimo = None
        for _ in range(3):
            response = requests.get(url_api, params=params, timeout=20, headers=headers)
            if response.ok and response.content:
                return response.json()
            ultimo = f"HTTP {response.status_code}"
            time.sleep(2)
        raise RuntimeError(ultimo or "sin respuesta")
