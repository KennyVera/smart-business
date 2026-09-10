"""Valida que el prompt del chat IA sea sobre el negocio / datos del sistema."""

from __future__ import annotations

import re
from rest_framework import serializers

MSG_SOLO_SISTEMA = (
    "Solo puedo ofrecer información del sistema Smart Business "
    "(ventas, inventario, clientes, sucursales y reportes). "
    "Reformula tu pregunta sobre esos datos."
)

MARCA_FUERA = "FUERA_DE_AMBITO"

# Debe aparecer al menos una de estas ideas para aceptar el prompt.
PALABRAS_NEGOCIO = (
    "venta",
    "vendid",
    "vender",
    "cliente",
    "producto",
    "stock",
    "inventario",
    "sucursal",
    "caja",
    "turno",
    "cajero",
    "factura",
    "ticket",
    "iva",
    "pago",
    "cobro",
    "reporte",
    "ranking",
    "gastad",
    "comprad",
    "compra",
    "kardex",
    "merma",
    "proveedor",
    "categor",
    "sku",
    "barcode",
    "código de barra",
    "codigo de barra",
    "ingreso",
    "utilidad",
    "margen",
    "bodega",
    "almacén",
    "almacen",
    "pedido",
    "devoluci",
    "arqueo",
    "descuadre",
    "punto",
    "crm",
    "pos",
    "erp",
    "negocio",
    "tienda",
    "local",
)

FUERA_OBVIO = re.compile(
    r"(?ix)"
    r"("
    r"\bcu[aá]nto\s+es\b|"
    r"\bcuanto\s+es\b|"
    r"\bcalcul[ae]\b|"
    r"\bresuelve\b|"
    r"\bmatem[aá]tica|"
    r"^\s*\d+\s*[\+\-\*\/x×]\s*\d+|"
    r"\d+\s*[\+\-\*\/x×]\s*\d+\s*[=\?]?\s*$|"
    r"\bchiste\b|"
    r"\bacertijo\b|"
    r"\breceta\b|"
    r"\bclima\b|"
    r"\bmam[aá]\b|"
    r"\bpap[aá]\b|"
    r"\bamor\b|"
    r"\bte\s+amo\b|"
    r"\bme\s+ama\b|"
    r"\bhora\s+actual\b|"
    r"\btraduce\b|"
    r"\bpoema\b|"
    r"\bcanci[oó]n\b|"
    r"\bhistoria\s+de\b|"
    r"\bcapital\s+de\b|"
    r"\bpresidente\s+de\b|"
    r"\bescribe\s+(un|una)\s+(ensayo|cuento|c[oó]digo)|"
    r"\bhola\b|"
    r"\bcomo\s+est[aá]s\b|"
    r"\bqui[eé]n\s+eres\b"
    r")"
)


def _tiene_vocabulario_negocio(texto: str) -> bool:
    bajo = texto.casefold()
    return any(p in bajo for p in PALABRAS_NEGOCIO)


def es_fuera_de_ambito(prompt: str) -> bool:
    """Sin vocabulario de negocio → fuera de ámbito (respuesta inmediata)."""
    texto = (prompt or "").strip()
    if not texto:
        return True
    if FUERA_OBVIO.search(texto):
        return True
    if re.fullmatch(r"[\d\s\+\-\*\/x×\(\)\.\=\?¿!¡]+", texto):
        return True
    # Regla fuerte: debe hablar del sistema.
    if not _tiene_vocabulario_negocio(texto):
        return True
    return False


def exigir_ambito_negocio(prompt: str) -> str:
    texto = (prompt or "").strip()
    if es_fuera_de_ambito(texto):
        raise serializers.ValidationError({"detail": MSG_SOLO_SISTEMA})
    return texto


def respuesta_es_fuera_de_ambito(texto_ia: str) -> bool:
    crudo = (texto_ia or "").strip().upper()
    if not crudo:
        return False
    if MARCA_FUERA in crudo.replace(" ", "_"):
        return True
    bajos = (texto_ia or "").casefold()
    senales = (
        "fuera de ámbito",
        "fuera de ambito",
        "no puedo ayudar",
        "solo puedo",
        "no está relacionado",
        "no esta relacionado",
        "no relacionado con",
    )
    if any(s in bajos for s in senales) and "select" not in bajos:
        return True
    return False
