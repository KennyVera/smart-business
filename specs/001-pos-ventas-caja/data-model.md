# 001 — Modelo de datos: caja y venta

Tablas reales en PostgreSQL. Los modelos Django de POS son `managed = False`
salvo que una migración `SeparateDatabaseAndState` altere columnas nuevas.

---

## 1. `turno_caja` → `TurnoCaja`

Un cajero opera **una** terminal por turno. `fecha_cierre IS NULL` = abierto.

| Campo | Tipo | Significado |
|-------|------|-------------|
| `id_turno` | PK | Identificador |
| `id_terminal` | FK `terminal_pos` | Caja física de la sucursal |
| `id_usuario` | FK usuario | Cajero |
| `fecha_apertura` | timestamptz | Alta automática |
| `fecha_cierre` | timestamptz null | Cierre |
| `monto_apertura` | numeric(10,2) | Fondo inicial |
| `monto_cierre_declarado` | numeric(10,2) null | Lo que el cajero declara al cerrar |
| `monto_esperado` | numeric(10,2) | Apertura + ventas en efectivo |
| `monto_cierre_real` | numeric(10,2) null | Conteo físico al cierre |
| `descuadre` | numeric(10,2) | `real − esperado` |
| `estado` | varchar(20) | `Abierto` / `Cerrado` |
| `auditado` | bool | Revisado por el gerente de sucursal |

La sucursal de la venta es la de la **terminal**, no la del perfil.

## 2. `venta` → `Venta`

Cabecera. Siempre cuelga de un turno. Cliente opcional (null = consumidor final).

| Campo | Tipo | Significado |
|-------|------|-------------|
| `id_venta` | PK | Folio de ticket |
| `id_turno` | FK | Turno de caja |
| `id_cliente` | FK `cliente` null | Afiliado CRM |
| `fecha_hora` | timestamptz | Momento del cobro |
| `subtotal_iva_0` | numeric(10,2) | Suma de líneas sin IVA |
| `subtotal_iva_15` | numeric(10,2) | Base gravada 15 % |
| `monto_iva` | numeric(10,2) | `subtotal_iva_15 * 0.15` |
| `total_factura` | numeric(10,2) | 0 % + 15 % + IVA |
| `monto_recibido` | numeric(10,2) | Lo que ingresó a caja (efectivo) o el total (otros métodos) |
| `cambio` | numeric(10,2) | `monto_recibido − total_factura` (0 si no es efectivo) |
| `anulada` | bool | Baja lógica (devolución autorizada por gerente) |

### Lógica de `monto_recibido` y `cambio`

- **Efectivo:** el cliente entrega un billete/monto ≥ total.  
  `cambio = monto_recibido − total_factura`. Si `monto_recibido < total`,
  la venta **no** se persiste.
- **No efectivo:** el sistema fuerza `monto_recibido = total_factura` y
  `cambio = 0`. El input de UI queda deshabilitado.

El serializer de lectura expone también `total` (alias de `total_factura`),
`cliente_nombre` y `metodo_pago`.

## 3. `venta_detalle` → `VentaDetalle`

PK compuesta `(id_venta, id_producto)`. Una línea por SKU (el backend agrupa).

| Campo | Tipo | Significado |
|-------|------|-------------|
| `id_venta` | FK | Cabecera |
| `id_producto` | FK | Catálogo |
| `cantidad` | int | Unidades cobradas |
| `precio_unitario_historico` | numeric(10,2) | Precio **congelado** al cobrar |
| `costo_unitario_historico` | numeric(10,2) | Costo **congelado** al cobrar |

El histórico evita que un cambio posterior de lista altere el margen de la
venta ya cerrada. `total_linea = precio_historico * cantidad`.

## 4. Tablas de apoyo

| Tabla | Modelo | Rol |
|-------|--------|-----|
| `metodo_pago` | `MetodoPago` | Efectivo, Tarjeta, Transferencia, Otros |
| `terminal_pos` | `TerminalPOS` | Caja física (`estado_activo`) |
| `pago_venta` | `PagoVenta` | PK `(venta, metodo_pago)`, `monto` = total cobrado |

## 5. Relación con inventario y CRM

Al procesar: se descuenta `inventario_stock`, se mueven lotes y se escribe
kardex `VENTA_POS`. El cliente, si existe, es `apps.crm.Cliente`.
