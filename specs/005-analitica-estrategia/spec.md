# 005 — Analítica y estrategia (panel admin)

**Estado:** parcial (shell de dashboard admin; KPIs de negocio aún mock/limitados).  
**Apps:** `frontend/src/modules/dashboard` (+ endpoints de sesiones en usuarios).  
**Roles:** `administrador`.

---

## 1. Objetivo

Dar al administrador una vista estratégica de la cadena: KPIs de ventas,
ingresos, sesiones y tendencias. Hoy existe el layout de tarjetas + gráfico
(`recharts`) + tabla; la mayoría de métricas de negocio aún no consumen
agregados reales de POS.

## 2. Superficie de UI

| Ruta | Página |
|------|--------|
| `/` (admin) | `AdminDashboardPage` vía `InicioSegunRol` |

Componentes: `DashboardKpis`, `DashboardChart` (`SalesLineChart`),
`DashboardTable`. Acento `#00AA5D`; respeta `color_graficos` de preferencias.

## 3. Datos actuales

- KPI **Sesiones**: `GET /api/usuarios/sesiones/resumen/` (real).
- Ventas / ingresos / conversión: placeholders o series demo en
  `dashboard/data/` hasta cablear agregados POS.

## 4. Fuera de alcance actual

- Cubo OLAP / data warehouse.
- Comparativos multi-sucursal con drill-down completo.
- Export ejecutivo programado.

Ver `tasks.md`.
