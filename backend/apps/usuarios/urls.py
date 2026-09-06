from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import RolViewSet, UsuarioViewSet
from .views_login import LoginView
from .views_sesiones import (
    LogoutView,
    ResumenSesionesView,
    RevocarSesionView,
    SesionesUsuarioView,
)
from .views_sucursales import SucursalAsignableViewSet

router = DefaultRouter()
router.register(r"roles", RolViewSet)
router.register(r"usuarios", UsuarioViewSet)
router.register(r"sucursales", SucursalAsignableViewSet, basename="sucursales-asignables")

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("usuarios/<int:pk>/sesiones/", SesionesUsuarioView.as_view(), name="usuario-sesiones"),
    path("sesiones/resumen/", ResumenSesionesView.as_view(), name="sesiones-resumen"),
    path("sesiones/<int:pk>/revocar/", RevocarSesionView.as_view(), name="sesion-revocar"),
    *router.urls,
]
