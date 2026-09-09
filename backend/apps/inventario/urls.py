from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CategoriaViewSet, ProductoViewSet, ProveedorViewSet
from .views_alertas import AlertasInventarioView
from .views_reportes import ReportesInventarioViewSet
from .views_stock import LoteViewSet, MermaViewSet, StockViewSet

router = DefaultRouter()
router.register(r"categorias", CategoriaViewSet)
router.register(r"proveedores", ProveedorViewSet)
router.register(r"productos", ProductoViewSet)
router.register(r"stock", StockViewSet, basename="stock")
router.register(r"lotes", LoteViewSet, basename="lotes")
router.register(r"mermas", MermaViewSet, basename="mermas")
router.register(r"reportes", ReportesInventarioViewSet, basename="reportes")

urlpatterns = [
    path("alertas/", AlertasInventarioView.as_view(), name="inventario-alertas"),
    *router.urls,
]
