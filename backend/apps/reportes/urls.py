from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import HistorialReporteIAViewSet, ReporteInteligenteAPIView

router = DefaultRouter()
router.register(r"historial", HistorialReporteIAViewSet, basename="historial-reporte-ia")

urlpatterns = [
    path(
        "inteligente/",
        ReporteInteligenteAPIView.as_view(),
        name="reporte-inteligente",
    ),
    path("", include(router.urls)),
]
