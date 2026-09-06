from .models_catalogo import Categoria, Producto
from .models_stock import InventarioStock, LoteCaducidad, RegistroMerma

__all__ = [
    "Categoria",
    "Producto",
    "InventarioStock",
    "LoteCaducidad",
    "RegistroMerma",
]
