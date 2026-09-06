import re

from rest_framework import serializers

USERNAME_RE = re.compile(r"^[A-Za-z][A-Za-z0-9._-]{3,29}$")
NOMBRE_RE = re.compile(
    r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '\-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$"
)
CLAVE_RE = re.compile(r"^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÜü])(?=.*\d).{8,64}$")


def exigir_username(valor):
    username = (valor or "").strip()
    if not USERNAME_RE.fullmatch(username):
        raise serializers.ValidationError(
            "4 a 30 caracteres, empieza con letra. Solo letras, números, punto, _ o -."
        )
    return username


def exigir_nombre(valor, etiqueta="Nombre"):
    texto = " ".join((valor or "").split())
    if len(texto) < 2 or len(texto) > 40 or not NOMBRE_RE.fullmatch(texto):
        raise serializers.ValidationError(
            f"{etiqueta}: 2 a 40 letras. Sin números ni símbolos."
        )
    return texto


def exigir_clave(valor):
    if not CLAVE_RE.fullmatch(valor or ""):
        raise serializers.ValidationError(
            "Mínimo 8 caracteres, con al menos una letra y un número."
        )
    return valor
