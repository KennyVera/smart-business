# 005 — Modelo de datos: analítica

No introduce tablas propias en esta fase. Consume agregados de dominios
existentes.

## Fuentes previstas

| Métrica | Origen |
|---------|--------|
| Ventas / ingresos | `venta` + `pago_venta` (POS), excluyendo `anulada` |
| IVA 15 % / 0 % | Campos `subtotal_iva_*`, `monto_iva` |
| Sesiones | `sesion_usuario` → resumen API usuarios |
| Top productos | `venta_detalle` agrupado |
| Por sucursal | `venta → turno → terminal → sucursal` |

## Contratos API (objetivo)

| Endpoint | Estado |
|----------|--------|
| `GET /api/usuarios/sesiones/resumen/` | Implementado |
| `GET /api/pos/...` agregados cadena | Pendiente / parcial (gerente ya tiene dashboard de **una** sucursal) |

## Notas

El dashboard del **gerente** (`005-gerente-sucursal`) no sustituye esta
analítica: es operativa y multi-tenant a una sucursal. Este módulo es visión
**cadena** para el administrador.
