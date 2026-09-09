# 008 — Research: preferencias de usuario

## Contexto de negocio

Cada operador (admin/gerente/bodeguero) personaliza densidad y colores sin
imponer un tema corporativo global. El cajero mantiene POS monocromático;
las preferencias impactan sobre todo layouts administrativos.

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Preferencias globales de empresa | **Fuera de alcance** de este spec |
| localStorage only | **Rechazado** — debe persistir en servidor |
| Un solo color para gráficos y confirms | **Rechazado** — `color_logs` separado |
| CSS variables en `:root` sin API | **Parcial** — se aplican desde Context tras API |

## Riesgos / deuda técnica

- Multipart logo + JSON fields en el mismo PATCH.
- POS monocromo no debe “heredar” sidebar de color por error de layout.
- Migraciones acumuladas (`0009`–`0011`) de preferencias.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `007-seguridad-usuarios` | Usuario 1:1 + menú cuenta |
| `005-gerente` / `005-analitica` | recharts |
| `002-inventario` | Paginación DataGrids |
| Constitución §3.1 | Regla de producto |
