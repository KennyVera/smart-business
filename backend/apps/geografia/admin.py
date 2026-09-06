from django.contrib import admin

from .models import CantonDistrito, Subzona, Sucursal, ZonaPlanificacion


@admin.register(ZonaPlanificacion)
class ZonaPlanificacionAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "id_nombre")
    search_fields = ("id_nombre", "nombre")


@admin.register(Subzona)
class SubzonaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "zona", "id_nombre")
    list_filter = ("zona",)
    search_fields = ("id_nombre", "nombre")


@admin.register(CantonDistrito)
class CantonDistritoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "subzona", "id_nombre")
    list_filter = ("subzona__zona",)
    search_fields = ("id_nombre", "nombre")


@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ("nombre", "canton", "telefono", "activa", "fecha_cierre")
    list_filter = ("activa",)
    search_fields = ("id_nombre", "nombre", "direccion")
