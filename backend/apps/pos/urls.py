from rest_framework.routers import DefaultRouter

from apps.crm.views_gerente import GerenteClienteViewSet

from .views import VentaViewSet
from .views_admin import AdminDashboardViewSet
from .views_caja import MetodoPagoViewSet, TurnoViewSet
from .views_catalogo import CatalogoPosViewSet, CategoriaPosViewSet, ClienteViewSet
from .views_gerente import GerenteReportesViewSet

router = DefaultRouter()
router.register(r"ventas", VentaViewSet, basename="pos-ventas")
router.register(r"turnos", TurnoViewSet, basename="pos-turnos")
router.register(r"metodos-pago", MetodoPagoViewSet, basename="pos-metodos-pago")
router.register(r"catalogo", CatalogoPosViewSet, basename="pos-catalogo")
router.register(r"categorias", CategoriaPosViewSet, basename="pos-categorias")
router.register(r"clientes", ClienteViewSet, basename="pos-clientes")
# Debe ir ANTES de "gerente": si no, gerente/<pk> captura "clientes".
router.register(
    r"gerente/clientes",
    GerenteClienteViewSet,
    basename="pos-gerente-clientes",
)
router.register(r"gerente", GerenteReportesViewSet, basename="pos-gerente")
router.register(r"admin-dashboard", AdminDashboardViewSet, basename="pos-admin-dashboard")

urlpatterns = router.urls
