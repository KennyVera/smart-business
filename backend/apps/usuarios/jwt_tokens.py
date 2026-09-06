import uuid
from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings

ALGORITMO = "HS256"


def emitir_jwt(usuario):
    jti = uuid.uuid4().hex
    ahora = datetime.now(timezone.utc)
    horas = getattr(settings, "JWT_EXPIRACION_HORAS", 12)
    token = jwt.encode(
        {
            "uid": usuario.id_usuario,
            "jti": jti,
            "iat": ahora,
            "exp": ahora + timedelta(hours=horas),
        },
        settings.SECRET_KEY,
        algorithm=ALGORITMO,
    )
    return token, jti


def decodificar_jwt(token):
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITMO])
