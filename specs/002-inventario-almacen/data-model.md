# 002 — Data model: inventario y almacén

Tablas en PostgreSQL (`requeson_erp_db`). Varios modelos son `managed = False`
(esquema legado); el kardex sí es gestionado por Django.

---

## Categoria

| Campo | Tipo | Notas |
|-------|------|--------|
| `id_categoria` | PK | |
| `nombre` | Char(100) | único |

`db_table = categoria`

## Producto

| Campo | Tipo | Notas |
|-------|------|--------|
| `id_producto` | PK | |
| `id_categoria` | FK → Categoria | PROTECT |
| `sku` | Char(50) | único (pistola / barcode) |
| `nombre` | Char(150) | |
| `precio_venta` | Decimal(10,2) | |
| `costo_actual` | Decimal(10,2) | |
| `imagen` | ImageField | `upload_to=productos/`, nullable |
| `aplica_iva` | Boolean | true = 15 %, false = tarifa 0 |

`db_table = producto` · **sin DELETE físico** (baja lógica futura).

## InventarioStock

Stock por **(sucursal, producto)** — clave compuesta.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id_sucursal` | FK | parte de PK |
| `id_producto` | FK | parte de PK |
| `cantidad_actual` | Integer | |
| `stock_minimo` | Integer | default 5; umbral de alerta |

`db_table = inventario_stock`

## LoteCaducidad

| Campo | Tipo | Notas |
|-------|------|--------|
| `id_lote` | PK | |
| `id_sucursal` / `id_producto` | FK | |
| `codigo_lote` | Char(50) | |
| `fecha_vencimiento` | Date | |
| `cantidad` | Integer | |

Ingreso → kardex `ENTRADA_LOTE`. Consumo operativo FIFO en ventas.

## RegistroMerma

| Campo | Tipo | Notas |
|-------|------|--------|
| `id_merma` | PK | |
| `id_sucursal` / `id_producto` / `id_usuario` | FK | |
| `cantidad` | Integer | |
| `motivo` | Char(255) | |
| `fecha` | DateTime | auto |

Descuenta stock + kardex `MERMA`. No anula ventas.

## HistorialMovimiento (Kardex)

| Campo | Tipo | Notas |
|-------|------|--------|
| `id_movimiento` | PK | |
| `id_sucursal` / `id_producto` / `id_usuario` | FK | usuario nullable |
| `tipo` | Char(20) | ver tabla abajo |
| `cantidad` | Integer | + entra / − sale |
| `stock_resultante` | Integer | |
| `referencia` | Char(255) | folio / motivo |
| `fecha` | DateTime | auto |

### Tipos de movimiento

| Tipo | Origen |
|------|--------|
| `ENTRADA_LOTE` | Alta de lote |
| `VENTA_POS` | Cobro en caja |
| `DEVOLUCION_POS` | Anulación / devolución gerente |
| `MERMA` | Baja operativa |
| `AJUSTE` | Ajuste manual |

Índice: `(producto, sucursal, -fecha)`.

## Archivos backend

- `apps/inventario/models_catalogo.py`
- `apps/inventario/models_stock.py`
- `apps/inventario/models_kardex.py`
- Serializers / views por dominio (catálogo, stock, alertas, reportes)
