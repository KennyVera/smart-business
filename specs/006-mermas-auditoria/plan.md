# 006 — Plan técnico: mermas y auditoría

## Objetivo de implementación

Bajas de inventario trazables y, en fases siguientes, un panel de auditoría
de almacén. La escritura hoy vive en `backend/apps/inventario` y
`frontend/src/modules/inventario` (no app Django separada aún).

## Stack

| Capa | Tecnología |
|------|------------|
| API | Django + DRF (`/api/inventario/mermas/`) |
| UI | React + Bootstrap modales / tablas |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `backend/apps/inventario` — `RegistroMerma`, views, kardex
- `frontend/src/modules/inventario` — `MermaFormModal`, Stock, Alertas
- Futuro: posible submódulo `auditoria` o rutas bajo inventario

## Decisiones clave

1. Merma ≠ anulación POS (dominios distintos).
2. Toda merma exige motivo y usuario autenticado.
3. Transacción: stock + kardex juntos.
4. Gerente no opera merma; solo consulta reportes/alertas.
5. Límite 150 líneas por archivo.

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | Alta merma + kardex | Hecho |
| B | Listado/filtros auditoría | Pendiente |
| C | Aprobaciones + notificaciones | Planificado |

## Referencias

- `spec.md`, `data-model.md`, `tasks.md`
- Constitución §3.2, §4.1; spec `002`
