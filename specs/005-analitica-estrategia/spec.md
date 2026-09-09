# 005 — Analítica y estrategia (panel admin)

**Estado:** operativo con datos reales de POS; faltan filtros de periodo/sucursal.  
**Apps:** `frontend/src/modules/dashboard`, `backend/apps/pos` (`admin-dashboard`).  
**Roles:** `administrador`.

---

## 1. Objetivo

Dar al administrador una vista estratégica de la cadena: KPIs de ventas,
ingresos, sesiones y tendencias, con acento `#00AA5D` y colores de gráficos
desde preferencias (`008`).

## 2. Superficie de UI

| Ruta | Página |
|------|--------|
| `/` (admin) | `AdminDashboardPage` vía `InicioSegunRol` |

Componentes: `DashboardKpis`, `DashboardChart` (`SalesLineChart`),
`CategoriesDonut`, `DashboardTable`.

## 3. Datos actuales

- KPI **Sesiones**: `GET /api/usuarios/sesiones/resumen/` (real).
- Ventas / ingresos / conversión / series / categorías / ranking sucursales:
  `GET /api/pos/admin-dashboard/` (`reportes_admin.dashboard_global`).
- Fallback demo solo si la API no responde o viene vacía.

## 4. Fuera de alcance / pendiente

- Filtros UI por rango de fechas y sucursal(es) — ver `tasks.md`.
- Cubo OLAP / data warehouse.
- Export ejecutivo programado.
