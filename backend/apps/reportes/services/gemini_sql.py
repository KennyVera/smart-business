import json
import re
import time
import urllib.error
import urllib.request
from decimal import Decimal

from django.conf import settings
from django.db import connection
from rest_framework import serializers

from apps.reportes.esquema import ESQUEMA_SQL
from apps.reportes.services.sql_fallback import intentar_sql_fallback
from apps.reportes.services.validacion_ambito import (
    MARCA_FUERA,
    MSG_SOLO_SISTEMA,
    respuesta_es_fuera_de_ambito,
)

FILAS_MAX = 200
REINTENTOS = 3
PROHIBIDOS = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|"
    r"COPY|EXECUTE|CALL|MERGE|REPLACE|ATTACH|DETACH|VACUUM|COMMENT|"
    r"SECURITY|OWNER|SET\s+ROLE|DO\b|INTO\s+OUTFILE)\b",
    re.IGNORECASE,
)


def limpiar_sql(texto):
    """Quita fences markdown y texto alrededor del SELECT."""
    crudo = (texto or "").strip()
    crudo = re.sub(r"^```(?:sql)?\s*", "", crudo, flags=re.IGNORECASE)
    crudo = re.sub(r"\s*```$", "", crudo)
    crudo = crudo.strip().rstrip(";").strip()
    match = re.search(r"(?is)\b(SELECT|WITH)\b", crudo)
    if match:
        crudo = crudo[match.start() :]
    return crudo.strip().rstrip(";").strip()


def validar_solo_select(query):
    sql = (query or "").strip()
    if not sql:
        raise serializers.ValidationError({"detail": "La IA no devolvió una consulta SQL."})
    upper = sql.upper()
    if not (upper.startswith("SELECT") or upper.startswith("WITH")):
        raise serializers.ValidationError(
            {"detail": "Solo se permiten consultas SELECT. La consulta fue rechazada."}
        )
    if ";" in sql:
        raise serializers.ValidationError(
            {"detail": "No se permiten múltiples sentencias SQL."}
        )
    if PROHIBIDOS.search(sql):
        raise serializers.ValidationError(
            {"detail": "La consulta contiene operaciones no permitidas."}
        )
    return sql


def serializar_celda(valor):
    if valor is None:
        return None
    if isinstance(valor, Decimal):
        return float(valor)
    if hasattr(valor, "isoformat"):
        return valor.isoformat()
    if isinstance(valor, (bytes, memoryview)):
        return str(valor)
    return valor


def ejecutar_select(query):
    """Ejecuta un SELECT seguro y retorna columnas + filas (dicts)."""
    from django.db import transaction

    sql = validar_solo_select(query)
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute("SET LOCAL statement_timeout = '8000'")
            cursor.execute(sql)
            if cursor.description is None:
                raise serializers.ValidationError(
                    {"detail": "La consulta no devolvió un resultado tabular."}
                )
            columnas = [col[0] for col in cursor.description]
            filas = cursor.fetchmany(FILAS_MAX + 1)
    if len(filas) > FILAS_MAX:
        raise serializers.ValidationError(
            {
                "detail": (
                    f"El resultado supera {FILAS_MAX} filas. "
                    "Pide un LIMIT más pequeño o un filtro más específico."
                )
            }
        )
    datos = [
        {col: serializar_celda(valor) for col, valor in zip(columnas, fila)}
        for fila in filas
    ]
    return columnas, datos


def _modelos_candidatos():
    primario = (settings.GEMINI_MODEL or "gemini-3.6-flash").strip()
    extras = [
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
    ]
    vistos = set()
    orden = []
    for nombre in [primario, *extras]:
        if nombre and nombre not in vistos:
            vistos.add(nombre)
            orden.append(nombre)
    return orden


def _mensaje_error_gemini(codigo, cuerpo: str) -> str:
    bajo = (cuerpo or "").lower()
    if codigo == 429 or "quota" in bajo or "resource_exhausted" in bajo:
        return (
            "Se agotó la cuota gratuita de Gemini (límite diario/minuto). "
            "Espera un rato, revisa https://ai.dev/rate-limit o habilita "
            "facturación en Google AI Studio. Mientras tanto se intentará "
            "un reporte local si el pedido es reconocible."
        )
    if codigo in (500, 503) or "internal" in bajo or "high demand" in bajo:
        return (
            "Gemini está saturado o con error temporal (500/503). "
            "Reintenta en unos segundos."
        )
    if codigo == 404:
        return (
            "El modelo de Gemini configurado no está disponible. "
            "Revisa GEMINI_MODEL en backend/.env."
        )
    corto = (cuerpo or "Error desconocido").strip()
    if len(corto) > 220:
        corto = corto[:220] + "…"
    return f"No se pudo contactar a Gemini ({codigo}): {corto}"


def _llamar_gemini_rest(api_key: str, modelo: str, instruccion: str) -> str:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{modelo}:generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"role": "user", "parts": [{"text": instruccion}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1024},
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        cuerpo = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(_mensaje_error_gemini(exc.code, cuerpo)) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"No se pudo contactar a Gemini: {exc.reason}") from exc

    candidatos = data.get("candidates") or []
    partes = []
    for cand in candidatos:
        content = cand.get("content") or {}
        for parte in content.get("parts") or []:
            if parte.get("text"):
                partes.append(parte["text"])
    texto = "\n".join(partes).strip()
    if not texto:
        raise RuntimeError("Gemini respondió vacío. Intenta de nuevo.")
    return texto


def _construir_instruccion(prompt_usuario: str, contexto_extra: str) -> str:
    return (
        "Eres el asistente de reportes de Smart Business (ERP/POS de Ecuador).\n"
        "SOLO respondes consultas sobre los datos del sistema: ventas, clientes, "
        "productos, inventario, stock, sucursales, cajas, pagos e IVA.\n\n"
        "Si la pregunta NO es sobre esos datos del negocio "
        "(por ejemplo matemáticas, chistes, clima u otros temas), "
        f"responde ÚNICAMENTE con la palabra exacta {MARCA_FUERA} "
        "sin SQL y sin explicaciones.\n\n"
        f"Esquema:\n{ESQUEMA_SQL}\n\n"
        f"{contexto_extra}\n"
        f"Solicitud: {prompt_usuario}\n\n"
        "Si SÍ es consulta de negocio: responde ÚNICAMENTE con SQL PostgreSQL "
        "(solo SELECT o WITH ... SELECT), sin markdown ni explicaciones."
    )


def generar_sql_con_gemini(prompt_usuario, contexto_extra=""):
    api_key = settings.GEMINI_API_KEY
    sql_local = intentar_sql_fallback(prompt_usuario)

    if not api_key or api_key == "tu_clave_aqui":
        if sql_local:
            return validar_solo_select(sql_local)
        raise serializers.ValidationError(
            {
                "detail": (
                    "Falta configurar GEMINI_API_KEY. "
                    "Pégala en backend/.env y reinicia el servidor."
                )
            }
        )

    instruccion = _construir_instruccion(prompt_usuario, contexto_extra)
    ultimo_error = None
    fallos_servidor = 0
    for modelo in _modelos_candidatos():
        for intento in range(REINTENTOS):
            try:
                texto = _llamar_gemini_rest(api_key, modelo, instruccion)
                if respuesta_es_fuera_de_ambito(texto):
                    raise serializers.ValidationError({"detail": MSG_SOLO_SISTEMA})
                sql = limpiar_sql(texto)
                if not sql.upper().startswith(("SELECT", "WITH")):
                    raise serializers.ValidationError({"detail": MSG_SOLO_SISTEMA})
                return sql
            except serializers.ValidationError:
                raise
            except Exception as exc:  # noqa: BLE001
                ultimo_error = str(exc)
                bajo = ultimo_error.lower()
                if "cuota" in bajo or "quota" in bajo:
                    # Cuota: usar fallback ya, no gastar más intentos.
                    if sql_local:
                        return validar_solo_select(sql_local)
                    break
                if "500" in bajo or "503" in bajo or "saturado" in bajo or "temporal" in bajo:
                    fallos_servidor += 1
                    if fallos_servidor >= 2 and sql_local:
                        return validar_solo_select(sql_local)
                time.sleep(0.4 * (intento + 1))

    if sql_local:
        return validar_solo_select(sql_local)

    raise serializers.ValidationError(
        {
            "detail": ultimo_error
            or "No se pudo generar el reporte con Gemini. Intenta de nuevo."
        }
    )
