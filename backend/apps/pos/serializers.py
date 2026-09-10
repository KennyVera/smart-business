from apps.crm.serializers import ClienteSerializer

from .serializers_caja import (
    AbrirTurnoSerializer,
    CerrarTurnoSerializer,
    MetodoPagoSerializer,
    TerminalSerializer,
    TurnoSerializer,
)
from .serializers_venta import (
    CatalogoGlobalPosSerializer,
    CatalogoPosSerializer,
    ProcesarVentaSerializer,
    VentaDetalleSerializer,
    VentaSerializer,
)

__all__ = [
    "MetodoPagoSerializer",
    "TerminalSerializer",
    "TurnoSerializer",
    "AbrirTurnoSerializer",
    "CerrarTurnoSerializer",
    "ClienteSerializer",
    "CatalogoPosSerializer",
    "CatalogoGlobalPosSerializer",
    "ProcesarVentaSerializer",
    "VentaSerializer",
    "VentaDetalleSerializer",
]
