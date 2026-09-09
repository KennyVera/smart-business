"""Payload de reportes CRM alineado al formato de reportes de inventario."""

from decimal import Decimal

from django.utils import timezone

from apps.pos.services.reportes_gerente import _sucursal_id

from ..views_gerente import aplicar_reporte, clientes_con_metricas

TIPOS = {
    "top_gastos": ("top_gastos", "Top {n} Clientes por Gastos", "Total gastado"),
    "top_visitas": ("top_frecuentes", "Top {n} Clientes por Visitas", "Visitas"),
    "cumpleanos_mes": ("cumpleanos_mes", "Cumpleañeros del mes (top {n})", "Clientes"),
}

LIMITE_DEF = 10
LIMITE_MAX = 100


def entero_limite(valor):
    try:
        return min(max(int(valor), 1), LIMITE_MAX)
    except (TypeError, ValueError):
        return LIMITE_DEF


def plata(valor):
    return float(round(valor or Decimal("0"), 2))


def dato(etiqueta, valor, formato="numero"):
    return {"etiqueta": etiqueta, "valor": valor, "formato": formato}


def armar_reporte(usuario, tipo="top_gastos", limite=LIMITE_DEF):
    clave_interna, plantilla, _etiqueta = TIPOS.get(
        tipo,
        TIPOS["top_gastos"],
    )
    tope = entero_limite(limite)
    sucursal_id = _sucursal_id(usuario)
    qs = clientes_con_metricas(sucursal_id)
    if clave_interna not in ("cumpleanos_mes", "cumpleanos_hoy"):
        qs = qs.filter(frecuencia_visitas__gt=0)
    qs = aplicar_reporte(qs, clave_interna, limite=tope)

    filas = []
    grafico = []
    for cliente in qs:
        nombre = f"{cliente.nombres} {cliente.apellidos}".strip()
        visitas = int(cliente.frecuencia_visitas or 0)
        gastado = plata(cliente.total_gastado)
        filas.append(
            {
                "cedula": cliente.cedula_ruc or "—",
                "cliente": nombre,
                "visitas": visitas,
                "total_gastado": gastado,
                "fecha_nacimiento": (
                    cliente.fecha_nacimiento.isoformat()
                    if cliente.fecha_nacimiento
                    else None
                ),
            }
        )
        grafico.append(
            {
                "nombre": nombre[:28],
                "valor": gastado if clave_interna == "top_gastos" else float(visitas),
            }
        )

    titulo = plantilla.format(n=len(filas) or tope)
    total_gasto = sum(f["total_gastado"] for f in filas)
    total_visitas = sum(f["visitas"] for f in filas)
    return {
        "titulo": titulo,
        "tipo": tipo,
        "limite": tope,
        "resumen": [
            dato("Clientes", len(filas)),
            dato("Visitas", total_visitas),
            dato("Gasto acumulado", round(total_gasto, 2), "dinero"),
            dato("Mostrados", f"{len(filas)} / {tope}"),
        ],
        "grafico": grafico[:12],
        "filas": filas,
        "generado": timezone.localtime().isoformat(timespec="seconds"),
    }
