from rest_framework.routers import DefaultRouter

from .views import (
    CantonViewSet,
    ProvinciaViewSet,
    SucursalViewSet,
    ZonaPlanificacionViewSet,
)

router = DefaultRouter()
router.register(r"zonas", ZonaPlanificacionViewSet)
router.register(r"provincias", ProvinciaViewSet)
router.register(r"subzonas", ProvinciaViewSet, basename="subzonas")  # compat
router.register(r"cantones", CantonViewSet)
router.register(r"sucursales", SucursalViewSet)

urlpatterns = router.urls
