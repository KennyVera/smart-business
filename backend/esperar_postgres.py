"""Espera a Postgres antes de levantar runserver.

Docker Desktop a veces publica el backend antes de que host.docker.internal
alcance el Postgres del host; sin esta espera Django muere en el arranque
y el login queda en 500.
"""

import os
import socket
import sys
import time

HOST = os.environ.get("POSTGRES_HOST", "localhost")
PUERTO = int(os.environ.get("POSTGRES_PORT", "5432"))
INTENTOS = 30


def listo():
    try:
        with socket.create_connection((HOST, PUERTO), 2):
            return True
    except OSError:
        return False


for intento in range(1, INTENTOS + 1):
    if listo():
        sys.exit(0)
    time.sleep(1)

sys.stderr.write(f"Postgres no responde en {HOST}:{PUERTO} tras {INTENTOS}s.\n")
sys.exit(1)
