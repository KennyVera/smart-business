from django.contrib import admin

from .models import Canton, Provincia, Sucursal, ZonaPlanificacion


@admin.register(ZonaPlanificacion)
class ZonaPlanificacionAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "descripcion", "id_nombre")
    ordering = ("codigo",)


@admin.register(Provincia)
class ProvinciaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "zona", "id_nombre")
    list_filter = ("zona",)


@admin.register(Canton)
class CantonAdmin(admin.ModelAdmin):
    list_display = ("nombre", "provincia", "id_nombre")
    list_filter = ("provincia__zona", "provincia")


@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ("nombre", "canton", "activa", "telefono")
    list_filter = ("activa", "canton__provincia__zona")
