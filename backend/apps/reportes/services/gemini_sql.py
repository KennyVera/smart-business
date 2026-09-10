import re
from decimal import Decimal

from django.conf import settings
from django.db import connection
from rest_framework import serializers

from apps.reportes.esquema import ESQUEMA_SQL
from apps.reportes.services.validacion_ambito import (
    MARCA_FUERA,
    MSG_SOLO_SISTEMA,
    respuesta_es_fuera_de_ambito,
)

FILAS_MAX = 200
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


def generar_sql_con_gemini(prompt_usuario, contexto_extra=""):
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "tu_clave_aqui":
        raise serializers.ValidationError(
            {
                "detail": (
                    "Falta configurar GEMINI_API_KEY. "
                    "Pégala en backend/.env y reinicia el servidor."
                )
            }
        )

    try:
        import google.generativeai as genai
    except ImportError as exc:
        raise serializers.ValidationError(
            {"detail": "El paquete google-generativeai no está instalado."}
        ) from exc

    genai.configure(api_key=api_key)
    modelo = genai.GenerativeModel(settings.GEMINI_MODEL)
    instruccion = (
        "Eres el asistente de reportes de Smart Business (ERP/POS de Ecuador).\n"
        "SOLO respondes consultas sobre los datos del sistema: ventas, clientes, "
        "productos, inventario, stock, sucursales, cajas, pagos e IVA.\n\n"
        "Si la pregunta NO es sobre esos datos del negocio "
        "(por ejemplo matemáticas como 'cuánto es 20*5', chistes, clima, "
        "cultura general, programación genérica u otros temas), "
        f"responde ÚNICAMENTE con la palabra exacta {MARCA_FUERA} "
        "sin SQL y sin explicaciones.\n\n"
        f"Esquema de base de datos:\n{ESQUEMA_SQL}\n\n"
        f"{contexto_extra}\n"
        f"Solicitud del usuario: {prompt_usuario}\n\n"
        "Si SÍ es una consulta de negocio: responde ÚNICAMENTE con SQL "
        "PostgreSQL válido (solo SELECT o WITH ... SELECT), sin markdown "
        "y sin explicaciones. No uses INSERT/UPDATE/DELETE/DDL."
    )
    try:
        respuesta = modelo.generate_content(instruccion)
    except Exception as exc:  # noqa: BLE001 — error de red/API hacia el cliente
        raise serializers.ValidationError(
            {"detail": f"No se pudo contactar a Gemini: {exc}"}
        ) from exc

    texto = getattr(respuesta, "text", None) or ""
    if not texto and getattr(respuesta, "candidates", None):
        partes = []
        for candidato in respuesta.candidates:
            contenido = getattr(candidato, "content", None)
            for parte in getattr(contenido, "parts", []) or []:
                if getattr(parte, "text", None):
                    partes.append(parte.text)
        texto = "\n".join(partes)

    if respuesta_es_fuera_de_ambito(texto):
        raise serializers.ValidationError({"detail": MSG_SOLO_SISTEMA})

    sql = limpiar_sql(texto)
    if not sql.upper().startswith(("SELECT", "WITH")):
        raise serializers.ValidationError({"detail": MSG_SOLO_SISTEMA})
    return sql
