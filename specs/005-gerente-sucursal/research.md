# 005 — Research: gerente de sucursal

## Contexto de negocio

El gerente responde por caja e inventario de **su** local. En Ecuador debe
ver desglose de IVA implícito en cierres y autorizar devoluciones sin tocar
otras sucursales. Un descuadre de caja debe avisarle al instante (campanita).

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Layout monocromático POS | **Rechazado** — carga cognitiva distinta |
| Filtrar solo en frontend | **Rechazado** — multi-tenant obligatorio en API |
| DELETE de factura | **Rechazado** — `anulada=True` + kardex |
| App Django `gerente` nueva | **Rechazado** — reportes viven en `apps.pos` |

## Riesgos / deuda técnica

- Cadena FK larga (`venta → turno → terminal → sucursal`) fácil de omitir.
- Notificaciones solo tipo CAJA por ahora; inventario pendiente.
- Admin también ve menú gerencial: debe probarse con sucursal nula.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `001-pos-ventas-caja` | Turnos, descuadre, ventas |
| `002-inventario-almacen` | Restock / kardex devolución |
| `004-multisucursal-geografia` | Sucursal del gerente |
| `007-seguridad-usuarios` | Rol + JWT |
| `008-preferencias-usuario` | Colores gráficos / confirmaciones |
