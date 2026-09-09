# 005 — Plan técnico: analítica estratégica

## Objetivo de implementación

Panel admin en `/` con KPIs y gráficos de cadena. UI en
`frontend/src/modules/dashboard`. Backend: reutilizar agregados POS/usuarios;
evitar app monolítica nueva hasta que existan contratos estables.

## Stack

| Capa | Tecnología |
|------|------------|
| UI | React + Vite + Bootstrap + **recharts** |
| API | DRF existente (`/api/usuarios/`, futuro `/api/pos/` agregados) |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `frontend/src/modules/dashboard`
- `backend/apps/usuarios` (resumen sesiones)
- `backend/apps/pos` (fuente de ventas; dashboard gerente ya existe)

## Decisiones clave

1. Separar **analítica cadena** (admin) de **dashboard sucursal** (gerente).
2. Gráficos con recharts; color vía `PreferencesContext`.
3. No inventar warehouse: SQL/ORM agregados sobre tablas operativas.
4. Archivos ≤ 150 líneas; KPIs/chart/tabla como piezas separadas.

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | Shell UI + KPI sesiones | Hecho |
| B | Agregados ventas cadena (`admin-dashboard`) | Hecho |
| C | Filtros fecha / sucursal | Pendiente (`tasks.md`) |
| D | Export ejecutivo programado | Planificado |

## Referencias

- `spec.md`, `data-model.md`, `tasks.md`
- Spec hermano: `005-gerente-sucursal`
