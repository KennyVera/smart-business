import re

from rest_framework import serializers

SKU_RE = re.compile(r"^[A-Za-z0-9\-]{4,50}$")
NOMBRE_RE = re.compile(r"^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,%°\-/()]{3,150}$")
MOTIVO_RE = re.compile(r"^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,;:%°\-/()]{5,255}$")


def exigir_sku(valor):
    sku = (valor or "").strip().upper()
    if not SKU_RE.match(sku):
        raise serializers.ValidationError(
            "El SKU admite 4 a 50 caracteres entre letras, números y guiones."
        )
    return sku


def exigir_nombre_libre(valor, etiqueta):
    nombre = " ".join((valor or "").split())
    if not NOMBRE_RE.match(nombre):
        raise serializers.ValidationError(
            f"{etiqueta} necesita entre 3 y 150 caracteres válidos."
        )
    return nombre


def exigir_motivo(valor):
    motivo = " ".join((valor or "").split())
    if not MOTIVO_RE.match(motivo):
        raise serializers.ValidationError(
            "Describe el motivo con 5 a 255 caracteres válidos."
        )
    return motivo


def exigir_codigo_lote(valor):
    codigo = (valor or "").strip().upper()
    if not SKU_RE.match(codigo):
        raise serializers.ValidationError(
            "El código de lote admite 4 a 50 caracteres entre letras, números y guiones."
        )
    return codigo
