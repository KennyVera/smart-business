# 004 — Plan técnico: multisucursal / geografía

## Objetivo de implementación

CRUD de la jerarquía territorial y maestro de sucursales para el admin,
alimentando el multi-tenant del resto del ERP. Backend
`backend/apps/geografia`; UI `frontend/src/modules/geografia`.

## Stack

| Capa | Tecnología |
|------|------------|
| API | Django + DRF (`/api/geografia/`) |
| UI | React + Vite + Bootstrap (DataGrid + Offcanvas) |
| BD | PostgreSQL |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `backend/apps/geografia` — modelos, serializers, views, seed, detalle
- `frontend/src/modules/geografia` — `ZonasPage`, `SucursalesPage`
- Consumidores: `usuarios` (asignación), `inventario` (stock), `pos` (terminal)

## Decisiones clave

1. Jerarquía zona → subzona → cantón → sucursal.
2. Admin-only en sidebar (`RequireRol` administrador).
3. Baja lógica de sucursal; nunca DELETE con historial.
4. Detalle de terminales vía servicio SQL ligero (nombre de sucursal).
5. Convivencia temporal con `SucursalExistente` (`managed = False`).

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | Modelos + API + seed | Hecho |
| B | UI zonas/sucursales + Offcanvas | Hecho |
| C | Mapa / asignación masiva / unificación de modelos | Pendiente |

## Referencias

- `spec.md`, `data-model.md`, `tasks.md`
- Constitución §2.3 (multi-tenant), §4.1 (baja lógica)
