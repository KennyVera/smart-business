# 005 — Research: analítica estratégica

## Contexto de negocio

Dirección necesita ver el pulso de la cadena (ventas, IVA, sucursales) sin
mezclarlo con la operación diaria del gerente de un solo local. En Ecuador
los reportes deben respetar bases gravadas 15 % y tarifa 0 %.

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Reusar dashboard gerente para admin | **Rechazado** — distinto alcance multi-tenant |
| BI externo (Metabase) en MVP | **Aplazado** — costo/ops |
| Materialized views | **Aplazado** — volumen demo no lo exige |
| Mock KPIs temporales | **Aceptado** en shell actual |

## Riesgos / deuda técnica

- KPIs de ventas aún no cableados → riesgo de “dashboard de mentira”.
- Duplicar lógica de agregación vs `reportes_gerente.py`.
- Anulaciones deben excluirse de totales.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `001-pos-ventas-caja` | Fuente de hechos |
| `004-multisucursal-geografia` | Dimensión sucursal |
| `005-gerente-sucursal` | Patrón de agregados / recharts |
| `008-preferencias-usuario` | Color de gráficos |
