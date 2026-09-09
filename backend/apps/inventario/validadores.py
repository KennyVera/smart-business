import re

from rest_framework import serializers

SKU_RE = re.compile(r"^[A-Za-z0-9\-]{4,50}$")
NOMBRE_RE = re.compile(r"^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,%°\-/()]{3,150}$")
CATEGORIA_RE = re.compile(
    r"^(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,&\-/()]{3,40}$"
)
MOTIVO_RE = re.compile(r"^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,;:%°\-/()]{5,255}$")
REPETIDO_RE = re.compile(r"^(.)\1+$")


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


def exigir_nombre_categoria(valor):
    nombre = " ".join((valor or "").split())
    if len(nombre) < 3:
        raise serializers.ValidationError(
            "La categoría necesita al menos 3 caracteres."
        )
    if len(nombre) > 40:
        raise serializers.ValidationError(
            "La categoría admite máximo 40 caracteres."
        )
    if not CATEGORIA_RE.match(nombre):
        raise serializers.ValidationError(
            "Usa un nombre claro con letras (números y signos básicos opcionales)."
        )
    if REPETIDO_RE.match(nombre.replace(" ", "")):
        raise serializers.ValidationError(
            "El nombre no puede ser un solo carácter repetido."
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
