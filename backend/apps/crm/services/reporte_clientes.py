"""Payload de reportes CRM alineado al formato de reportes de inventario."""

from collections import defaultdict
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone

from apps.pos.models import VentaDetalle
from apps.pos.services.reportes_gerente import _sucursal_id

from ..views_gerente import aplicar_reporte, clientes_con_metricas

TIPOS = {
    "top_gastos": ("top_gastos", "Top {n} Clientes por Gastos", "Total gastado"),
    "top_visitas": ("top_frecuentes", "Top {n} Clientes por Visitas", "Visitas"),
    "clientes_perdidos": (
        "riesgo_abandono",
        "Clientes perdidos (+45 días) top {n}",
        "Días sin compra",
    ),
    "cumpleanos_mes": ("cumpleanos_mes", "Cumpleañeros del mes (top {n})", "Clientes"),
}

LIMITE_DEF = 10
LIMITE_MAX = 100
TOP_PRODUCTOS = 3


def entero_limite(valor):
    try:
        return min(max(int(valor), 1), LIMITE_MAX)
    except (TypeError, ValueError):
        return LIMITE_DEF


def parse_fecha(valor, defecto):
    try:
        return date.fromisoformat(valor)
    except (TypeError, ValueError):
        return defecto


def rango_fechas(params):
    hoy = date.today()
    hasta = parse_fecha(
        params.get("fecha_hasta") or params.get("end_date"),
        hoy,
    )
    desde = parse_fecha(
        params.get("fecha_desde") or params.get("start_date"),
        hoy.replace(day=1),
    )
    if desde > hasta:
        desde, hasta = hasta, desde
    zona = timezone.get_current_timezone()
    inicio = timezone.make_aware(datetime.combine(desde, time.min), zona)
    fin = timezone.make_aware(datetime.combine(hasta, time.max), zona)
    return desde, hasta, inicio, fin


def plata(valor):
    return float(round(valor or Decimal("0"), 2))


def dato(etiqueta, valor, formato="numero"):
    return {"etiqueta": etiqueta, "valor": valor, "formato": formato}


def top_productos_por_cliente(cliente_ids, sucursal_id, inicio, fin, top=TOP_PRODUCTOS):
    """Top N productos por cantidad vendida en el rango, por cliente."""
    if not cliente_ids:
        return {}
    filas = (
        VentaDetalle.objects.filter(
            venta__anulada=False,
            venta__cliente_id__in=cliente_ids,
            venta__turno__terminal__sucursal_id=sucursal_id,
            venta__fecha_hora__gte=inicio,
            venta__fecha_hora__lte=fin,
        )
        .values("venta__cliente_id", "producto__nombre")
        .annotate(unidades=Sum("cantidad"))
        .order_by("venta__cliente_id", "-unidades")
    )
    por_cliente = defaultdict(list)
    for fila in filas:
        cid = fila["venta__cliente_id"]
        if len(por_cliente[cid]) >= top:
            continue
        nombre = (fila["producto__nombre"] or "Producto").strip()
        por_cliente[cid].append(f"{nombre} ({int(fila['unidades'] or 0)})")
    return {cid: ", ".join(items) for cid, items in por_cliente.items()}


def _qs_perdidos(sucursal_id, inicio, fin, tope):
    """+45 días sin compra anclado al Hasta; respeta ventana de fechas."""
    qs = clientes_con_metricas(sucursal_id)
    corte = fin - timedelta(days=45)
    qs = qs.filter(frecuencia_visitas__gt=0, ultima_compra__lt=corte)
    if inicio:
        qs = qs.filter(ultima_compra__gte=inicio - timedelta(days=365))
    ids = list(
        qs.order_by("ultima_compra", "apellidos", "nombres").values_list(
            "pk", flat=True
        )[:tope]
    )
    return qs.filter(pk__in=ids).order_by("ultima_compra", "apellidos", "nombres")


def formato_visita(dt):
    if not dt:
        return "—"
    local = timezone.localtime(dt) if timezone.is_aware(dt) else dt
    return local.strftime("%d/%m/%Y")


def mapa_ultima_visita(cliente_ids, sucursal_id):
    """Última compra real (histórico), no solo la del rango filtrado."""
    if not cliente_ids:
        return {}
    return {
        c.pk: c.ultima_compra
        for c in clientes_con_metricas(sucursal_id).filter(pk__in=cliente_ids)
    }


def armar_reporte(usuario, tipo="top_gastos", limite=LIMITE_DEF, params=None):
    params = params or {}
    clave_interna, plantilla, _etiqueta = TIPOS.get(tipo, TIPOS["top_gastos"])
    tope = entero_limite(limite)
    desde, hasta, inicio, fin = rango_fechas(params)
    sucursal_id = _sucursal_id(usuario)

    if clave_interna == "riesgo_abandono":
        qs = _qs_perdidos(sucursal_id, inicio, fin, tope)
        prod_inicio, prod_fin = inicio - timedelta(days=365), fin
    else:
        qs = clientes_con_metricas(sucursal_id, desde=inicio, hasta=fin)
        if clave_interna not in ("cumpleanos_mes", "cumpleanos_hoy"):
            qs = qs.filter(frecuencia_visitas__gt=0)
        qs = aplicar_reporte(qs, clave_interna, limite=tope)
        prod_inicio, prod_fin = inicio, fin

    clientes = list(qs)
    ids = [c.pk for c in clientes]
    favoritos = top_productos_por_cliente(ids, sucursal_id, prod_inicio, prod_fin)
    ultimas = mapa_ultima_visita(ids, sucursal_id)

    filas = []
    grafico = []
    for cliente in clientes:
        nombre = f"{cliente.nombres} {cliente.apellidos}".strip()
        visitas = int(cliente.frecuencia_visitas or 0)
        gastado = plata(cliente.total_gastado)
        filas.append(
            {
                "cedula": cliente.cedula_ruc or "—",
                "cliente": nombre,
                "productos_frecuentes": favoritos.get(cliente.pk) or "—",
                "ultima_visita": formato_visita(ultimas.get(cliente.pk)),
                "visitas": visitas,
                "total_gastado": gastado,
                "fecha_nacimiento": (
                    cliente.fecha_nacimiento.isoformat()
                    if cliente.fecha_nacimiento
                    else None
                ),
            }
        )
        medida = gastado if clave_interna == "top_gastos" else float(visitas)
        grafico.append({"nombre": nombre[:28], "valor": medida})

    titulo = plantilla.format(n=len(filas) or tope)
    total_gasto = sum(f["total_gastado"] for f in filas)
    total_visitas = sum(f["visitas"] for f in filas)
    return {
        "titulo": titulo,
        "tipo": tipo,
        "limite": tope,
        "periodo": {"desde": desde.isoformat(), "hasta": hasta.isoformat()},
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
