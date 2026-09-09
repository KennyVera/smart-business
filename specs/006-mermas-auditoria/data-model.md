# 006 — Modelo de datos: mermas

Tabla física `registro_merma`. Modelo
`apps.inventario.models_stock.RegistroMerma` (`managed = False`).

---

## `registro_merma` → `RegistroMerma`

| Campo | Tipo | Significado |
|-------|------|-------------|
| `id_merma` | PK | Identificador |
| `id_sucursal` | FK | Sucursal donde baja el stock |
| `id_producto` | FK | SKU afectado |
| `id_usuario` | FK | Quién registró |
| `cantidad` | int | Unidades dadas de baja (> 0) |
| `motivo` | varchar(255) | Rotura / vencido / etc. |
| `fecha` | timestamptz | Alta automática |

## Efectos colaterales

1. `InventarioStock.cantidad_actual` −= cantidad (misma sucursal/producto).
2. `HistorialMovimiento` tipo `MERMA` (cantidad negativa / salida).
3. Opcionalmente consume o ajusta `LoteCaducidad` si el flujo de UI lo indica.

## Relación con auditoría

La auditoría de almacén **lee** mermas + kardex; no crea otra tabla en esta
fase. Futuros sellos de “revisado por auditor” pueden extender el modelo.
