"""Reportes globales del dashboard administrador."""

from calendar import month_abbr
from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal
import unicodedata

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Q, Sum
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone

from apps.geografia.models import Sucursal

from ..models import Venta, VentaDetalle

DINERO = DecimalField(max_digits=12, decimal_places=2)
TOTAL_LINEA = ExpressionWrapper(
    F("cantidad") * F("precio_unitario_historico"),
    output_field=DINERO,
)

MESES_ES = {
    1: "Ene",
    2: "Feb",
    3: "Mar",
    4: "Abr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Ago",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dic",
}

COLORES = [
    "#00AA5D",
    "#1c1f24",
    "#6c757d",
    "#343a40",
    "#adb5bd",
    "#198754",
    "#495057",
]

ETIQUETAS_CAT = {
    "lacteos": "Lacteos",
    "panaderia": "Panaderia",
    "bebidas": "Bebidas",
    "abarrotes": "Abarrotes",
    "limpieza": "Limpieza",
    "dulces": "Dulces",
    "snacks": "Snacks",
}


def _etiqueta_categoria(nombre):
    crudo = (nombre or "Otros").strip() or "Otros"
    plano = unicodedata.normalize("NFKD", crudo)
    plano = "".join(c for c in plano if not unicodedata.combining(c)).lower()
    return ETIQUETAS_CAT.get(plano, crudo)


def _ventas_validas():
    return Venta.objects.filter(anulada=False)


def dashboard_global():
    """KPIs + series mensuales por categoria + ranking de categorias."""
    zona = timezone.get_current_timezone()
    hoy = timezone.localdate()
    inicio_periodo = (hoy.replace(day=1) - timedelta(days=120)).replace(day=1)
    inicio_dt = timezone.make_aware(datetime.combine(inicio_periodo, datetime.min.time()))

    ventas = _ventas_validas()
    kpis = ventas.aggregate(
        tickets=Count("id_venta"),
        ingresos=Coalesce(Sum("total_factura"), Decimal("0")),
        con_cliente=Count("id_venta", filter=~Q(cliente__isnull=True)),
    )
    tickets = kpis["tickets"] or 0
    con_cliente = kpis["con_cliente"] or 0
    conversion = round((con_cliente / tickets) * 100, 1) if tickets else 0

    lineas = (
        VentaDetalle.objects.filter(
            venta__anulada=False,
            venta__fecha_hora__gte=inicio_dt,
        )
        .annotate(mes=TruncMonth("venta__fecha_hora", tzinfo=zona))
        .values("mes", categoria=F("producto__categoria__nombre"))
        .annotate(total=Coalesce(Sum(TOTAL_LINEA), Decimal("0")))
        .order_by("mes", "categoria")
    )

    categorias = []
    vistos = set()
    por_mes = defaultdict(lambda: defaultdict(Decimal))
    for fila in lineas:
        cat = _etiqueta_categoria(fila["categoria"])
        if cat not in vistos:
            vistos.add(cat)
            categorias.append(cat)
        if fila["mes"] is None:
            continue
        mes_local = timezone.localtime(fila["mes"]).date().replace(day=1)
        por_mes[mes_local][cat] += fila["total"]

    meses = []
    cursor = hoy.replace(day=1)
    for _ in range(5):
        meses.append(cursor)
        if cursor.month == 1:
            cursor = cursor.replace(year=cursor.year - 1, month=12)
        else:
            cursor = cursor.replace(month=cursor.month - 1)
    meses.reverse()

    series = []
    for mes in meses:
        fila = {"mes": MESES_ES.get(mes.month, month_abbr[mes.month])}
        for cat in categorias:
            fila[cat] = float(por_mes[mes].get(cat, Decimal("0")))
        series.append(fila)

    populares_raw = defaultdict(lambda: {"value": 0, "monto": Decimal("0")})
    for fila in (
        VentaDetalle.objects.filter(venta__anulada=False)
        .values(name=F("producto__categoria__nombre"))
        .annotate(
            value=Coalesce(Sum("cantidad"), 0),
            monto=Coalesce(Sum(TOTAL_LINEA), Decimal("0")),
        )
    ):
        cat = _etiqueta_categoria(fila["name"])
        populares_raw[cat]["value"] += int(fila["value"] or 0)
        populares_raw[cat]["monto"] += fila["monto"] or Decimal("0")

    populares = sorted(
        populares_raw.items(),
        key=lambda item: item[1]["value"],
        reverse=True,
    )[:6]
    categorias_populares = [
        {
            "name": nombre,
            "value": datos["value"],
            "monto": datos["monto"],
            "color": COLORES[i % len(COLORES)],
        }
        for i, (nombre, datos) in enumerate(populares)
        if datos["value"] > 0
    ]

    return {
        "kpis": {
            "tickets": tickets,
            "ingresos": kpis["ingresos"] or Decimal("0"),
            "conversion": conversion,
            "con_cliente": con_cliente,
        },
        "series": series,
        "lineas": [
            {"key": cat, "color": COLORES[i % len(COLORES)]}
            for i, cat in enumerate(categorias)
        ],
        "categorias_populares": categorias_populares,
        "sucursales_recientes": sucursales_recientes(),
    }


def sucursales_recientes(limite=10):
    filas = Sucursal.objects.select_related(
        "canton",
        "canton__subzona",
        "canton__subzona__zona",
    ).order_by("-fecha_apertura", "nombre")[:limite]
    return [
        {
            "nombre": s.nombre,
            "fecha": s.fecha_apertura.isoformat() if s.fecha_apertura else "",
            "telefono": s.telefono or "—",
            "ubicacion": s.canton.nombre if s.canton_id else s.direccion,
            "registrada": "Activa" if s.activa else "Inactiva",
        }
        for s in filas
    ]
