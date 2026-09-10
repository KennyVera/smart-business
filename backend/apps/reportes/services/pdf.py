"""PDF de reportes IA: encabezado con logo, KPIs, gráfico real y detalle."""

from __future__ import annotations

import base64
from html import escape
from io import BytesIO
from pathlib import Path

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone

ACENTO = "#111111"
ACENTO_SUAVE = "#f3f4f5"
MARCA = "#00aa5d"
COLORES_PASTEL = [
    "#00aa5d",
    "#3b82f6",
    "#8b5cf6",
    "#111111",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
]

PREFER_ETIQUETA = (
    "nombres",
    "nombre",
    "cliente",
    "producto",
    "cedula",
    "sku",
    "categoria",
    "descripcion",
)
PREFER_VALOR = (
    "total_comprado",
    "total_gastado",
    "total",
    "gasto",
    "monto",
    "cantidad_compras",
    "cantidad",
    "visitas",
    "unidades",
    "precio",
    "importe",
)


def _celda(valor):
    if valor is None:
        return "—"
    if isinstance(valor, float):
        return f"{valor:,.2f}"
    if isinstance(valor, int):
        return f"{valor:,}".replace(",", ".")
    return escape(str(valor))


def _es_numero(valor):
    return isinstance(valor, (int, float)) and not isinstance(valor, bool)


def _rank_columna(nombre, preferidas):
    bajo = (nombre or "").lower().replace(" ", "_")
    for i, pref in enumerate(preferidas):
        if pref in bajo:
            return i
    return 100


def _ejes(columnas, datos):
    """Elige etiqueta legible + métrica numérica (evita IDs como eje Y)."""
    if not columnas or not datos:
        return None, None
    muestra = datos[0]
    textos = [c for c in columnas if isinstance(muestra.get(c), str)]
    numeros = [c for c in columnas if _es_numero(muestra.get(c))]
    if not textos:
        textos = list(columnas)
    if not numeros:
        return (textos[0] if textos else None), None

    x_key = sorted(textos, key=lambda c: _rank_columna(c, PREFER_ETIQUETA))[0]
    y_candidatos = [c for c in numeros if c != x_key] or numeros
    y_key = sorted(y_candidatos, key=lambda c: _rank_columna(c, PREFER_VALOR))[0]
    return x_key, y_key


def _formatear_kpi(valor, monetario=False):
    if valor is None:
        return "—"
    if monetario:
        return f"$ {float(valor):,.2f}"
    if isinstance(valor, float) and not float(valor).is_integer():
        return f"{float(valor):,.2f}"
    try:
        return f"{int(valor):,}".replace(",", ".")
    except (TypeError, ValueError):
        return str(valor)


def _parece_moneda(nombre):
    texto = (nombre or "").lower()
    return any(
        p in texto
        for p in (
            "total",
            "gasto",
            "monto",
            "precio",
            "venta",
            "factura",
            "importe",
            "subtotal",
            "comprado",
            "iva",
        )
    )


def _resumen_kpis(columnas, datos):
    x_key, y_key = _ejes(columnas, datos)
    n = len(datos)
    kpis = [{"etiqueta": "REGISTROS", "valor": _formatear_kpi(n)}]

    if x_key:
        unicos = len({str(fila.get(x_key)) for fila in datos})
        etiqueta = (x_key or "CATEGORÍAS").replace("_", " ").upper()[:18]
        kpis.append({"etiqueta": etiqueta, "valor": _formatear_kpi(unicos)})

    if y_key:
        valores = [float(fila.get(y_key) or 0) for fila in datos]
        monetario = _parece_moneda(y_key)
        etiqueta = (y_key or "TOTAL").replace("_", " ").upper()[:18]
        kpis.append(
            {
                "etiqueta": etiqueta,
                "valor": _formatear_kpi(sum(valores), monetario=monetario),
            }
        )
        kpis.append({"etiqueta": "MOSTRADOS", "valor": f"{n} / {n}"})
    else:
        kpis.append({"etiqueta": "COLUMNAS", "valor": _formatear_kpi(len(columnas))})
        kpis.append({"etiqueta": "MOSTRADOS", "valor": f"{n} / {n}"})

    return kpis[:4]


def _logo_path():
    candidatos = [
        Path(__file__).resolve().parent.parent
        / "static"
        / "reportes"
        / "logo-smart-business.png",
        Path(settings.BASE_DIR)
        / "apps"
        / "reportes"
        / "static"
        / "reportes"
        / "logo-smart-business.png",
        Path(settings.BASE_DIR).parent
        / "frontend"
        / "src"
        / "assets"
        / "logo-smart-business.png",
    ]
    for ruta in candidatos:
        if ruta.is_file():
            return ruta
    return None


def _logo_data_uri():
    ruta = _logo_path()
    if ruta is None:
        return ""
    try:
        from PIL import Image

        imagen = Image.open(ruta).convert("RGBA")
        bbox = imagen.getbbox()
        if bbox:
            imagen = imagen.crop(bbox)
        alto = 64
        ratio = alto / max(imagen.size[1], 1)
        ancho = max(1, int(imagen.size[0] * ratio))
        imagen = imagen.resize((ancho, alto), Image.Resampling.LANCZOS)
        buf = BytesIO()
        imagen.save(buf, format="PNG", optimize=True)
        data = base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception:  # noqa: BLE001
        data = base64.b64encode(ruta.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{data}"


def _grafico_png_data_uri(columnas, datos, max_items=8):
    """Genera pastel (≤8 filas) o barras horizontales como PNG embebible."""
    x_key, y_key = _ejes(columnas, datos)
    if not x_key or not y_key or not datos:
        return "", ""

    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return "", ""

    filas = datos[:max_items]
    etiquetas = []
    for fila in filas:
        texto = str(fila.get(x_key) if fila.get(x_key) is not None else "—")
        # Preferir nombre compuesto si existen columnas nombres/apellidos
        if "nombres" in {c.lower() for c in columnas}:
            nom = fila.get("nombres") or fila.get("NOMBRES") or ""
            ape = fila.get("apellidos") or fila.get("APELLIDOS") or ""
            compuesto = f"{nom} {ape}".strip()
            if compuesto:
                texto = compuesto
        etiquetas.append(texto[:28])
    valores = [max(float(fila.get(y_key) or 0), 0) for fila in filas]
    if sum(valores) <= 0:
        return "", ""

    fig, ax = plt.subplots(figsize=(7.2, 3.6), dpi=140)
    colores = COLORES_PASTEL * ((len(valores) // len(COLORES_PASTEL)) + 1)

    if len(valores) <= 8:
        wedges, *_ = ax.pie(
            valores,
            labels=etiquetas,
            colors=colores[: len(valores)],
            startangle=90,
            wedgeprops={"linewidth": 1, "edgecolor": "white"},
            textprops={"fontsize": 8, "color": "#343a40"},
        )
        ax.axis("equal")
        titulo = f"DISTRIBUCIÓN · {(y_key or '').replace('_', ' ').upper()}"
    else:
        ypos = range(len(valores))[::-1]
        ax.barh(list(ypos), valores[::-1], color=ACENTO, height=0.55)
        ax.set_yticks(list(ypos))
        ax.set_yticklabels(etiquetas[::-1], fontsize=8)
        ax.spines[["top", "right"]].set_visible(False)
        titulo = f"RANKING · {(y_key or '').replace('_', ' ').upper()}"

    fig.tight_layout(pad=0.4)
    buf = BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor="white")
    plt.close(fig)
    data = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{data}", titulo


def _auditoria(usuario):
    ahora = timezone.localtime()
    nombre = ""
    rol = ""
    if usuario is not None:
        nombre = (
            f"{getattr(usuario, 'nombre', '')} {getattr(usuario, 'apellido', '')}"
        ).strip()
        if not nombre:
            nombre = getattr(usuario, "username", "") or "Usuario"
        rol = getattr(getattr(usuario, "rol", None), "nombre", "") or "—"
    return {
        "usuario": nombre or "—",
        "rol": rol or "—",
        "fecha": ahora.strftime("%d/%m/%Y"),
        "hora": ahora.strftime("%I:%M:%S %p").lstrip("0").lower(),
    }


def generar_pdf_historial(reporte, usuario=None):
    try:
        from xhtml2pdf import pisa
    except ImportError as exc:
        raise ValueError(
            "Falta el paquete xhtml2pdf en el servidor. Reconstruye la imagen Docker."
        ) from exc

    snapshot = reporte.datos_json or {}
    columnas = list(snapshot.get("columnas") or [])
    datos = list(snapshot.get("datos") or [])
    titulo = escape(reporte.prompt_usuario or "Reporte inteligente")
    audit = _auditoria(usuario)
    kpis = _resumen_kpis(columnas, datos)
    logo = _logo_data_uri()
    grafico_src, grafico_titulo = _grafico_png_data_uri(columnas, datos)

    logo_html = (
        f'<img class="logo-img" src="{logo}" alt="Smart Business" />'
        if logo
        else f'<span class="logo-box" style="background:{MARCA};"></span>'
    )

    kpi_html = "".join(
        "<td class=\"kpi\">"
        f"<span>{escape(item['etiqueta'])}</span>"
        f"<strong>{escape(str(item['valor']))}</strong>"
        "</td>"
        for item in kpis
    )

    thead = "".join(f"<th>{escape(str(col))}</th>" for col in columnas)
    cuerpo = []
    for i, fila in enumerate(datos):
        zebra = ' class="zebra"' if i % 2 else ""
        celdas = "".join(f"<td>{_celda(fila.get(col))}</td>" for col in columnas)
        cuerpo.append(f"<tr{zebra}>{celdas}</tr>")
    tbody = "".join(cuerpo) or (
        f'<tr><td colspan="{max(len(columnas), 1)}">Sin datos</td></tr>'
    )

    alcance = (
        f"Reportes IA · {len(datos)} registro"
        f"{'' if len(datos) == 1 else 's'} · Uso interno / auditoría"
    )

    if grafico_src:
        grafico_html = f"""
        <section class="bloque">
          <h2>{escape(grafico_titulo or "GRÁFICO")}</h2>
          <div class="grafico-wrap">
            <img class="grafico-img" src="{grafico_src}" alt="Gráfico del reporte" />
          </div>
        </section>
        """
    else:
        grafico_html = ""

    page = "A4 landscape" if len(columnas) >= 5 else "A4"

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    @page {{ size: {page}; margin: 1.1cm; }}
    body {{
      font-family: Helvetica, Arial, sans-serif;
      color: #212529;
      font-size: 9pt;
    }}
    .head {{
      width: 100%;
      border-bottom: 2px solid {ACENTO};
      padding-bottom: 8px;
      margin-bottom: 12px;
    }}
    .head td {{ vertical-align: middle; border: 0; padding: 0; }}
    .marca {{ width: 52%; }}
    .logo-box {{
      display: inline-block;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      vertical-align: middle;
      margin-right: 8px;
    }}
    .logo-img {{
      height: 52px;
      width: auto;
      vertical-align: middle;
      margin-right: 10px;
    }}
    .marca-txt {{ display: inline-block; vertical-align: middle; }}
    .marca-txt strong {{ display: block; font-size: 13pt; color: #111; }}
    .marca-txt small {{ color: #8a9096; font-size: 8pt; }}
    .meta {{ text-align: right; font-size: 8pt; color: #343a40; width: 48%; }}
    .meta span {{
      color: #8a9096;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-right: 4px;
    }}
    .meta p {{ margin: 0 0 2px; }}
    h1 {{
      text-align: center;
      font-size: 14pt;
      color: #111;
      margin: 10px 0 4px;
    }}
    .alcance {{
      text-align: center;
      color: #8a9096;
      font-size: 8pt;
      margin: 0 0 12px;
    }}
    table.kpis {{
      width: 100%;
      border-collapse: separate;
      border-spacing: 6px 0;
      margin-bottom: 14px;
    }}
    td.kpi {{
      width: 25%;
      border: 1px solid #e6eaee;
      border-left: 3px solid {ACENTO};
      padding: 7px 8px;
      background: #fff;
    }}
    td.kpi span {{
      display: block;
      font-size: 7pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8a9096;
      margin-bottom: 2px;
    }}
    td.kpi strong {{ font-size: 11pt; color: #111; }}
    .bloque {{ margin-bottom: 14px; }}
    .bloque h2 {{
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6c757d;
      border-bottom: 1px solid #eef1f3;
      padding-bottom: 3px;
      margin: 0 0 8px;
    }}
    .grafico-wrap {{ text-align: center; }}
    .grafico-img {{
      width: 520px;
      max-width: 100%;
      height: auto;
    }}
    table.detalle {{
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }}
    table.detalle th {{
      background: {ACENTO};
      color: #fff;
      text-align: left;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 5px 4px;
    }}
    table.detalle td {{
      font-size: 8pt;
      padding: 4px;
      border-bottom: 1px solid #eef1f3;
      color: #343a40;
      word-wrap: break-word;
    }}
    table.detalle tr.zebra td {{ background: {ACENTO_SUAVE}; }}
    .pie {{
      margin-top: 12px;
      padding-top: 6px;
      border-top: 1px solid #eef1f3;
      font-size: 7pt;
      color: #8a9096;
      text-align: center;
    }}
  </style>
</head>
<body>
  <table class="head">
    <tr>
      <td class="marca">
        {logo_html}
        <span class="marca-txt">
          <strong>Smart Business</strong>
          <small>Módulo de Reportes IA · Análisis asistido</small>
        </span>
      </td>
      <td class="meta">
        <p><span>Generado por</span> {escape(audit["usuario"])}</p>
        <p><span>Rol</span> {escape(audit["rol"])}</p>
        <p><span>Fecha y hora</span> {escape(audit["fecha"])} · {escape(audit["hora"])}</p>
      </td>
    </tr>
  </table>

  <h1>{titulo}</h1>
  <p class="alcance">{escape(alcance)}</p>

  <table class="kpis"><tr>{kpi_html}</tr></table>

  {grafico_html}

  <section class="bloque">
    <h2>Detalle</h2>
    <table class="detalle">
      <thead><tr>{thead}</tr></thead>
      <tbody>{tbody}</tbody>
    </table>
  </section>

  <p class="pie">
    Documento generado automáticamente por Smart Business ·
    {escape(audit["fecha"])} {escape(audit["hora"])} · Uso interno / auditoría
  </p>
</body>
</html>"""

    buffer = BytesIO()
    resultado = pisa.CreatePDF(src=html, dest=buffer, encoding="utf-8")
    if resultado.err:
        raise ValueError("No se pudo generar el PDF.")
    return buffer.getvalue()


def respuesta_pdf(reporte, usuario=None):
    contenido = generar_pdf_historial(reporte, usuario=usuario)
    nombre = f"reporte-ia-{reporte.pk}.pdf"
    response = HttpResponse(contenido, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{nombre}"'
    return response
