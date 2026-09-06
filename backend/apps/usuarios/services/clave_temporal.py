import secrets
import string

ALFABETO = string.ascii_uppercase + string.digits


def generar_clave_temporal():
    cuerpo = "".join(secrets.choice(ALFABETO) for _ in range(8))
    return f"Tmp{cuerpo}"
