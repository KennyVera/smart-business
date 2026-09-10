from django.contrib import admin

from .models import HistorialReporteIA


@admin.register(HistorialReporteIA)
class HistorialReporteIAAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "fecha_creacion", "prompt_corto")
    list_filter = ("fecha_creacion",)
    search_fields = ("prompt_usuario", "sql_generado")
    readonly_fields = ("fecha_creacion",)

    @admin.display(description="Prompt")
    def prompt_corto(self, obj):
        return (obj.prompt_usuario or "")[:80]
