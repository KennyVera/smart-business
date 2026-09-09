"""Reglas de identificación y datos de cliente para facturación en Ecuador."""

import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email

PROVINCIAS = frozenset(range(1, 25)) | {30}
COEF_CEDULA = (2, 1, 2, 1, 2, 1, 2, 1, 2)
COEF_RUC_PRIVADO = (4, 3, 2, 7, 6, 5, 4, 3, 2)
COEF_RUC_PUBLICO = (3, 2, 7, 6, 5, 4, 3, 2)
NOMBRE_MAX = 100
CORREO_MAX = 100
TELEFONO_MAX = 10
NOMBRE_RE = re.compile(
    r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$"
)


def solo_digitos(valor):
    return "".join(caracter for caracter in (valor or "") if caracter.isdigit())


def _provincia_ok(codigo):
    return codigo in PROVINCIAS


def _cedula_natural(digitos):
    if len(digitos) != 10 or not digitos.isdigit():
        return False
    if not _provincia_ok(int(digitos[:2])):
        return False
    if int(digitos[2]) > 5:
        return False
    total = 0
    for indice, coeficiente in enumerate(COEF_CEDULA):
        valor = int(digitos[indice]) * coeficiente
        if valor >= 10:
            valor -= 9
        total += valor
    verificador = (10 - (total % 10)) % 10
    return verificador == int(digitos[9])


def _modulo11(digitos, coeficientes):
    total = sum(int(digito) * coef for digito, coef in zip(digitos, coeficientes))
    residuo = total % 11
    if residuo == 0:
        return 0
    verificador = 11 - residuo
    if verificador == 10:
        return None
    return verificador


def identificacion_valida(valor):
    digitos = solo_digitos(valor)
    if len(digitos) == 10:
        return _cedula_natural(digitos)
    if len(digitos) != 13:
        return False
    if not _provincia_ok(int(digitos[:2])):
        return False
    tercer = int(digitos[2])
    if tercer <= 5:
        return _cedula_natural(digitos[:10]) and digitos[10:].isdigit()
    if tercer == 6:
        return _modulo11(digitos[:8], COEF_RUC_PUBLICO) == int(digitos[8])
    if tercer == 9:
        return _modulo11(digitos[:9], COEF_RUC_PRIVADO) == int(digitos[9])
    return False


def mensaje_identificacion(valor):
    digitos = solo_digitos(valor)
    if len(digitos) not in (10, 13):
        return "La cédula debe tener 10 dígitos o el RUC 13."
    if not identificacion_valida(digitos):
        return (
            "El RUC no es válido."
            if len(digitos) == 13
            else "La cédula no es válida."
        )
    return ""


def limpiar_nombre(valor):
    return " ".join((valor or "").split())


def nombre_persona_ok(valor):
    texto = limpiar_nombre(valor)
    if len(texto) < 2 or len(texto) > NOMBRE_MAX:
        return False
    return bool(NOMBRE_RE.fullmatch(texto))


def mensaje_nombre(valor, etiqueta):
    texto = limpiar_nombre(valor)
    if not texto:
        return f"Indica los {etiqueta} del cliente."
    if len(texto) > NOMBRE_MAX:
        return f"Los {etiqueta} admiten hasta {NOMBRE_MAX} caracteres."
    if not nombre_persona_ok(texto):
        return f"Los {etiqueta} solo admiten letras, espacios y guiones."
    return ""


def mensaje_correo(valor):
    correo = (valor or "").strip()
    if not correo:
        return ""
    if len(correo) > CORREO_MAX:
        return f"El correo admite hasta {CORREO_MAX} caracteres."
    try:
        validate_email(correo)
    except DjangoValidationError:
        return "Escribe un correo válido para la factura electrónica."
    if correo.count("@") != 1:
        return "Escribe un correo válido para la factura electrónica."
    return ""


def mensaje_telefono(valor):
    telefono = solo_digitos(valor)
    if not telefono:
        return ""
    if len(telefono) != TELEFONO_MAX:
        return f"El teléfono móvil debe tener exactamente {TELEFONO_MAX} dígitos."
    return ""
