# 005 — Plan técnico: gerente de sucursal

## Objetivo de implementación

Panel operativo multi-tenant para el gerente: dashboard del día, auditoría de
cajas con desglose, devoluciones/anulaciones y notificaciones de descuadre.
API bajo `/api/pos/gerente/*` y `/api/notificaciones/`; UI
`frontend/src/modules/gerente`.

## Stack

| Capa | Tecnología |
|------|------------|
| API | Django + DRF (app `pos` + notificaciones en `usuarios`) |
| UI | React + Vite + Bootstrap + recharts |
| Layout | Admin (sidebar oscuro + header), acento `#00AA5D` |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `backend/apps/pos` — `views_gerente`, anulación, signals de descuadre
- `backend/apps/usuarios` — `Notificacion`, campanita
- `frontend/src/modules/gerente` — Dashboard, Auditoría, Devoluciones
- `frontend/src/modules/layout` — Bell + RBAC sidebar

## Decisiones clave

1. Filtro obligatorio `request.user.sucursal_id` en todos los endpoints.
2. Anular = restock + kardex `DEVOLUCION_POS` + `anulada=True` (atómico).
3. Gerente **sin** Catálogo/Stock ops; sí Alertas/Reportes lectura.
4. Offcanvas de turno (mismo patrón visual que Kardex).
5. Command `crear_gerente_cuenca` para demo.

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | Multi-tenant + anulación + dashboard | Hecho |
| B | Auditoría filtros + desglose + auditar | Hecho |
| C | Notificaciones CAJA + RBAC frontend | Hecho |

## Referencias

- `spec.md`, `data-model.md`, `tasks.md`
- Constitución §2.3, §3.4, §4.3, §4.6
