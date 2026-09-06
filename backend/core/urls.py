from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({"status": "ok", "service": "smart-business"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/geografia/", include("apps.geografia.urls")),
    path("api/usuarios/", include("apps.usuarios.urls")),
]
