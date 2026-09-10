"""Text-to-SQL local cuando Gemini no responde (cuota, 500, 503)."""

from __future__ import annotations

import re


def _limite(texto: str, default: int = 10) -> int:
    m = re.search(r"\btop\s+(\d+)\b", texto, re.I)
    if m:
        return max(1, min(int(m.group(1)), 50))
    m = re.search(r"\b(?:los|las|el|la)?\s*(\d+)\s+(?:productos|clientes|sucursales)\b", texto, re.I)
    if m:
        return max(1, min(int(m.group(1)), 50))
    return default


def _sucursal_filtro(texto: str) -> str | None:
    # "sucursal de Guayaquil" / "en Cuenca Centro" / "Guayaquil Sur"
    m = re.search(
        r"sucursal(?:es)?\s+(?:de\s+|del?\s+)?([a-záéíóúñ0-9\s\-]+?)(?:\s*$|[?.!,]|\s+en\s+|\s+del?\s+|\s+con\s+)",
        texto,
        re.I,
    )
    if m:
        nombre = m.group(1).strip(" .")
        if len(nombre) >= 3:
            return nombre
    for pista in (
        "guayaquil",
        "cuenca",
        "quito",
        "manta",
        "ibarra",
        "malecon",
        "malecón",
    ):
        if pista in texto:
            return pista
    return None


def intentar_sql_fallback(prompt_usuario: str) -> str | None:
    """Devuelve SQL SELECT si reconoce el patrón; None si no."""
    t = (prompt_usuario or "").strip().lower()
    if not t:
        return None

    lim = _limite(t, 10)
    suc = _sucursal_filtro(t)
    join_suc = """
FROM venta_detalle vd
JOIN venta v ON v.id_venta = vd.id_venta AND v.anulada = FALSE
JOIN turno_caja tc ON tc.id_turno = v.id_turno
JOIN terminal_pos tp ON tp.id_terminal = tc.id_terminal
JOIN sucursal s ON s.id_sucursal = tp.id_sucursal
JOIN producto p ON p.id_producto = vd.id_producto
""".strip()
    where_suc = f" AND s.nombre ILIKE '%{suc.replace(chr(39), '')}%'" if suc else ""

    # Top productos más vendidos
    if re.search(r"productos?.{0,60}(m[aá]s\s+(?:se\s+)?vend|top|mejor)", t) or re.search(
        r"(top|m[aá]s\s+(?:se\s+)?vend).{0,60}productos?", t
    ):
        return f"""
SELECT p.nombre AS producto,
       SUM(vd.cantidad) AS unidades,
       ROUND(SUM(vd.cantidad * vd.precio_unitario_historico)::numeric, 2) AS total_ventas
{join_suc}
WHERE 1=1{where_suc}
GROUP BY p.id_producto, p.nombre
ORDER BY unidades DESC
LIMIT {lim}
""".strip()

    # Ventas por sucursal
    if re.search(r"ventas?.{0,30}(por\s+)?sucursal", t) or "comparar sucursales" in t:
        return """
SELECT s.nombre AS sucursal,
       COUNT(v.id_venta) AS num_ventas,
       ROUND(SUM(v.total_factura)::numeric, 2) AS total
FROM venta v
JOIN turno_caja tc ON tc.id_turno = v.id_turno
JOIN terminal_pos tp ON tp.id_terminal = tc.id_terminal
JOIN sucursal s ON s.id_sucursal = tp.id_sucursal
WHERE v.anulada = FALSE
GROUP BY s.id_sucursal, s.nombre
ORDER BY total DESC
LIMIT 50
""".strip()

    # Stock bajo / crítico
    if re.search(r"stock\s*(bajo|critico|crítico|minimo|mínimo)", t) or "sin stock" in t:
        filtro = ""
        if suc:
            limpio = suc.replace("'", "")
            filtro = f"AND s.nombre ILIKE '%{limpio}%'"
        return f"""
SELECT s.nombre AS sucursal, p.nombre AS producto,
       i.cantidad_actual, i.stock_minimo
FROM inventario_stock i
JOIN producto p ON p.id_producto = i.id_producto
JOIN sucursal s ON s.id_sucursal = i.id_sucursal
WHERE i.cantidad_actual <= i.stock_minimo
{filtro}
ORDER BY i.cantidad_actual ASC
LIMIT {lim}
""".strip()

    # Top clientes
    if re.search(r"clientes?.{0,40}(m[aá]s|top|mejor|gast)", t) or re.search(
        r"(top|m[aá]s).{0,40}clientes?", t
    ):
        return f"""
SELECT c.nombres || ' ' || COALESCE(c.apellidos,'') AS cliente,
       COUNT(v.id_venta) AS visitas,
       ROUND(SUM(v.total_factura)::numeric, 2) AS total_gastado
FROM venta v
JOIN cliente c ON c.id_cliente = v.id_cliente
JOIN turno_caja tc ON tc.id_turno = v.id_turno
JOIN terminal_pos tp ON tp.id_terminal = tc.id_terminal
JOIN sucursal s ON s.id_sucursal = tp.id_sucursal
WHERE v.anulada = FALSE AND v.id_cliente IS NOT NULL{where_suc}
GROUP BY c.id_cliente, c.nombres, c.apellidos
ORDER BY total_gastado DESC
LIMIT {lim}
""".strip()

    # Ventas del día / hoy
    if re.search(r"ventas?.{0,20}(de\s+)?(hoy|del\s+d[ií]a)", t):
        return f"""
SELECT DATE(v.fecha_hora) AS dia,
       COUNT(*) AS num_ventas,
       ROUND(SUM(v.total_factura)::numeric, 2) AS total
FROM venta v
JOIN turno_caja tc ON tc.id_turno = v.id_turno
JOIN terminal_pos tp ON tp.id_terminal = tc.id_terminal
JOIN sucursal s ON s.id_sucursal = tp.id_sucursal
WHERE v.anulada = FALSE
  AND v.fecha_hora::date = CURRENT_DATE{where_suc}
GROUP BY DATE(v.fecha_hora)
""".strip()

    return None
