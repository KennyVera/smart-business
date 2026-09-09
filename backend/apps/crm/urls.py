from rest_framework.routers import DefaultRouter

from .views import ClienteViewSet
from .views_gerente import GerenteClienteViewSet

router = DefaultRouter()
router.register(r"clientes", ClienteViewSet, basename="crm-clientes")
router.register(
    r"gerente/clientes",
    GerenteClienteViewSet,
    basename="crm-gerente-clientes",
)

urlpatterns = router.urls
