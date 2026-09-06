from django.contrib import admin

from .models import Rol, Usuario


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ("id_rol", "nombre")
    search_fields = ("nombre",)


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("id_usuario", "username", "nombre", "apellido", "rol", "estado_activo")
    list_filter = ("estado_activo", "rol")
    search_fields = ("username", "nombre", "apellido")
