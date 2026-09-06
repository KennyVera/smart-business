from rest_framework.routers import DefaultRouter

from .views import (
    CantonDistritoViewSet,
    SubzonaViewSet,
    SucursalViewSet,
    ZonaPlanificacionViewSet,
)

router = DefaultRouter()
router.register(r"zonas", ZonaPlanificacionViewSet)
router.register(r"subzonas", SubzonaViewSet)
router.register(r"cantones", CantonDistritoViewSet)
router.register(r"sucursales", SucursalViewSet)

urlpatterns = router.urls
