from django.conf import settings
from django.conf.urls.static import static
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
    path("api/inventario/", include("apps.inventario.urls")),
    path("api/pos/", include("apps.pos.urls")),
    path("api/crm/", include("apps.crm.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
