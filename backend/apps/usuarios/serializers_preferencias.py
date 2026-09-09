from rest_framework import serializers
import re

from .models_preferencias import (
    COLOR_GRAFICOS_DEF,
    COLOR_LOGS_DEF,
    COLOR_SIDEBAR_DEF,
    FILAS_VALIDAS,
    PreferenciaUsuario,
)

HEX = r"^#[0-9A-Fa-f]{6}$"


class PreferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenciaUsuario
        fields = (
            "color_sidebar",
            "color_graficos",
            "color_logs",
            "logo_personalizado",
            "filas_por_pagina",
        )

    def validate_color_sidebar(self, value):
        return self._color(value, COLOR_SIDEBAR_DEF)

    def validate_color_graficos(self, value):
        return self._color(value, COLOR_GRAFICOS_DEF)

    def validate_color_logs(self, value):
        return self._color(value, COLOR_LOGS_DEF)

    def validate_filas_por_pagina(self, value):
        if value not in FILAS_VALIDAS:
            raise serializers.ValidationError(
                f"Usa uno de: {', '.join(map(str, FILAS_VALIDAS))}."
            )
        return value

    def validate_logo_personalizado(self, value):
        if value is None:
            return value
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Máximo 2 MB.")
        return value

    def _color(self, value, defecto):
        texto = (value or defecto).strip()
        if not re.fullmatch(HEX, texto):
            raise serializers.ValidationError("Color hex inválido (#RRGGBB).")
        return texto.upper()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        logo = instance.logo_personalizado
        data["logo_personalizado"] = logo.url if logo else None
        return data
