from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import ClienteViewSet
from .views_gerente import GerenteClienteViewSet
from .views_reportes import ReporteClientesView

router = DefaultRouter()
router.register(r"clientes", ClienteViewSet, basename="crm-clientes")
router.register(
    r"gerente/clientes",
    GerenteClienteViewSet,
    basename="crm-gerente-clientes",
)

urlpatterns = [
    path(
        "reportes/clientes/",
        ReporteClientesView.as_view(),
        name="crm-reportes-clientes",
    ),
] + router.urls
