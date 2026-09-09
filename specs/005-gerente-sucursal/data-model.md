# 005 — Modelo de datos: gerente / auditoría / anulación

## Extensiones sobre POS

### `turno_caja` → `TurnoCaja` (campos de auditoría)

| Campo | Tipo | Significado |
|-------|------|-------------|
| `monto_esperado` | numeric(10,2) | Apertura + efectivo cobrado |
| `monto_cierre_real` | numeric(10,2) null | Conteo físico |
| `descuadre` | numeric(10,2) | `real − esperado` |
| `estado` | varchar(20) | `Abierto` / `Cerrado` |
| `auditado` | bool default false | Revisado por el gerente |

### `venta` → `Venta`

| Campo | Tipo | Significado |
|-------|------|-------------|
| `anulada` | bool default false | Baja lógica de la factura |

Cadena de sucursal: `Venta → TurnoCaja → TerminalPOS → Sucursal`.

### Kardex

Tipo `DEVOLUCION_POS`: cantidad **positiva** al restockear por anulación.

## Identidad

| Entidad | Valor demo |
|---------|------------|
| Rol | `Gerente de Sucursal` |
| Usuario | `gerente_cuenca` |
| Clave | `Admin123!` |
| Sucursal | `Cuenca Centro` (obligatoria) |

Command: `python manage.py crear_gerente_cuenca`.

## Tabla `notificacion` → `Notificacion`

| Campo | Tipo | Significado |
|-------|------|-------------|
| `id_notificacion` | PK | Identificador |
| `usuario` | FK usuario | Destinatario (gerente) |
| `titulo` | varchar(100) | Resumen corto |
| `mensaje` | text | Detalle |
| `tipo` | varchar(20) | `CAJA` / `INVENTARIO` / `SISTEMA` |
| `leida` | bool | Default false |
| `fecha_creacion` | timestamptz | Alta automática |

Signal POS: `post_save` de `TurnoCaja` (estado `Cerrado` + `descuadre ≠ 0`)
crea una fila por cada gerente activo de `terminal.sucursal`.

## Endpoints de auditoría (detalle)

`GET /api/pos/gerente/auditoria-cajas/?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD`

- Sin fechas → cierres de los **últimos 7 días** (inclusivo).
- Siempre `terminal__sucursal_id = request.user.sucursal_id`.

`GET /api/pos/gerente/auditoria-cajas/<id>/desglose/`

| Campo | Origen |
|-------|--------|
| `monto_apertura` | `TurnoCaja` |
| `ventas_efectivo` | Suma `PagoVenta` método Efectivo (ventas no anuladas) |
| `ventas_tarjeta` / `ventas_transferencia` / `ventas_otros` | Idem por método |
| `monto_esperado` | Guardado en cierre (= apertura + efectivo) |
| `monto_cierre_real` / `descuadre` | Declarados al cerrar |
| `tickets` | Últimas 5 `Venta` del turno |