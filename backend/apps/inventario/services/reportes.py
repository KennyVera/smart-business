from datetime import timezone as zona_utc
from decimal import Decimal

from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from django.utils import timezone

DINERO = DecimalField(max_digits=16, decimal_places=2)
COSTO_LINEA = ExpressionWrapper(
    F("cantidad_actual") * F("producto__costo_actual"),
    output_field=DINERO,
)
VENTA_LINEA = ExpressionWrapper(
    F("cantidad_actual") * F("producto__precio_venta"),
    output_field=DINERO,
)


def plata(valor):
    return float(round(valor or Decimal("0"), 2))


def dato(etiqueta, valor, formato="numero"):
    return {"etiqueta": etiqueta, "valor": valor, "formato": formato}


def con_zona(valor):
    """Las tablas heredadas guardan la hora en UTC sin zona declarada."""
    if valor is None:
        return None
    if timezone.is_naive(valor):
        valor = valor.replace(tzinfo=zona_utc.utc)
    return timezone.localtime(valor)


def nombre_usuario(usuario):
    if usuario is None:
        return "Sistema"
    return f"{usuario.nombre} {usuario.apellido}".strip() or usuario.username


def valorizado(stock):
    filas = [
        {
            "sku": fila.producto.sku,
            "producto": fila.producto.nombre,
            "categoria": fila.producto.categoria.nombre,
            "sucursal": fila.sucursal.nombre,
            "cantidad": fila.cantidad_actual,
            "costo_unitario": plata(fila.producto.costo_actual),
            "costo_total": plata(fila.cantidad_actual * fila.producto.costo_actual),
            "venta_total": plata(fila.cantidad_actual * fila.producto.precio_venta),
        }
        for fila in stock.filter(cantidad_actual__gt=0)
    ]
    agrupado = (
        stock.filter(cantidad_actual__gt=0)
        .values("producto__categoria__nombre")
        .annotate(
            costo=Sum(COSTO_LINEA),
            venta=Sum(VENTA_LINEA),
            unidades=Sum("cantidad_actual"),
        )
        .order_by("-costo")
    )
    grafico = [
        {
            "nombre": item["producto__categoria__nombre"],
            "valor": plata(item["costo"]),
            "venta": plata(item["venta"]),
            "unidades": item["unidades"],
        }
        for item in agrupado
    ]
    costo = sum(item["valor"] for item in grafico)
    venta = sum(item["venta"] for item in grafico)
    return {
        "titulo": "Inventario valorizado",
        "resumen": [
            dato("Capital en bodega", round(costo, 2), "dinero"),
            dato("Valor de venta", round(venta, 2), "dinero"),
            dato("Utilidad potencial", round(venta - costo, 2), "dinero"),
            dato("Unidades", sum(item["unidades"] for item in grafico)),
        ],
        "grafico": grafico,
        "filas": sorted(filas, key=lambda fila: -fila["costo_total"]),
    }


def mermas(registros, desde, hasta):
    filas = [
        {
            "fecha": con_zona(merma.fecha).strftime("%d/%m/%Y %H:%M"),
            "sku": merma.producto.sku,
            "producto": merma.producto.nombre,
            "sucursal": merma.sucursal.nombre,
            "motivo": merma.motivo,
            "cantidad": merma.cantidad,
            "costo_total": plata(merma.cantidad * merma.producto.costo_actual),
            "usuario": nombre_usuario(merma.usuario),
        }
        for merma in registros
    ]
    por_motivo = {}
    for fila in filas:
        acumulado = por_motivo.setdefault(
            fila["motivo"],
            {"nombre": fila["motivo"], "valor": 0, "unidades": 0, "registros": 0},
        )
        acumulado["valor"] = round(acumulado["valor"] + fila["costo_total"], 2)
        acumulado["unidades"] += fila["cantidad"]
        acumulado["registros"] += 1
    grafico = sorted(por_motivo.values(), key=lambda item: -item["valor"])
    return {
        "titulo": "Análisis de mermas",
        "periodo": {"desde": desde.isoformat(), "hasta": hasta.isoformat()},
        "resumen": [
            dato("Pérdida al costo", round(sum(i["valor"] for i in grafico), 2), "dinero"),
            dato("Unidades dadas de baja", sum(i["unidades"] for i in grafico)),
            dato("Registros", len(filas)),
            dato("Motivos distintos", len(grafico)),
        ],
        "grafico": grafico,
        "filas": filas,
    }


def stock_muerto(stock, ultimas_salidas, ultimos_movimientos, dias):
    ahora = timezone.now()
    filas = []
    for fila in stock.filter(cantidad_actual__gt=0):
        clave = (fila.producto_id, fila.sucursal_id)
        referencia = con_zona(
            ultimas_salidas.get(clave) or ultimos_movimientos.get(clave)
        )
        sin_mover = (ahora - referencia).days if referencia else None
        if sin_mover is not None and sin_mover < dias:
            continue
        filas.append(
            {
                "sku": fila.producto.sku,
                "producto": fila.producto.nombre,
                "categoria": fila.producto.categoria.nombre,
                "sucursal": fila.sucursal.nombre,
                "cantidad": fila.cantidad_actual,
                "dias_sin_salida": sin_mover if sin_mover is not None else "Sin registros",
                "capital": plata(fila.cantidad_actual * fila.producto.costo_actual),
            }
        )
    filas.sort(key=lambda fila: -fila["capital"])
    grafico = agrupar(filas, "categoria", "capital")
    return {
        "titulo": "Stock muerto / sin rotación",
        "dias": dias,
        "resumen": [
            dato("Capital inmovilizado", round(sum(f["capital"] for f in filas), 2), "dinero"),
            dato("Productos sin rotar", len(filas)),
            dato("Unidades detenidas", sum(f["cantidad"] for f in filas)),
            dato("Categorías afectadas", len(grafico)),
        ],
        "grafico": grafico,
        "filas": filas,
    }


def sugerido_compras(stock):
    filas = []
    for fila in stock.filter(cantidad_actual__lte=F("stock_minimo")):
        sugerido = max(fila.stock_minimo * 2 - fila.cantidad_actual, 1)
        filas.append(
            {
                "sku": fila.producto.sku,
                "producto": fila.producto.nombre,
                "categoria": fila.producto.categoria.nombre,
                "sucursal": fila.sucursal.nombre,
                "cantidad": fila.cantidad_actual,
                "stock_minimo": fila.stock_minimo,
                "sugerido": sugerido,
                "inversion": plata(sugerido * fila.producto.costo_actual),
            }
        )
    filas.sort(key=lambda fila: (fila["cantidad"], -fila["inversion"]))
    return {
        "titulo": "Sugerido de compras",
        "resumen": [
            dato("Inversión estimada", round(sum(f["inversion"] for f in filas), 2), "dinero"),
            dato("Productos a reponer", len(filas)),
            dato("Unidades sugeridas", sum(f["sugerido"] for f in filas)),
            dato("Sin stock", len([f for f in filas if f["cantidad"] == 0])),
        ],
        "grafico": agrupar(filas, "categoria", "inversion"),
        "filas": filas,
    }


def agrupar(filas, campo, medida):
    acumulado = {}
    for fila in filas:
        item = acumulado.setdefault(fila[campo], {"nombre": fila[campo], "valor": 0})
        item["valor"] = round(item["valor"] + fila[medida], 2)
    return sorted(acumulado.values(), key=lambda item: -item["valor"])
