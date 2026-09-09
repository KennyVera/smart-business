# 006 — Research: mermas y auditoría

## Contexto de negocio

En retail ecuatoriano las mermas (vencidos, roturas) impactan margen y deben
quedar auditables ante controles internos. No se confunden con devoluciones
de cliente (que reingresan stock vía anulación POS).

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| App Django `mermas` separada en v1 | **Aplazado** — vive en inventario |
| Merma sin kardex | **Rechazado** — rompe auditoría |
| Texto libre vs catálogo de motivos | **Texto** ahora; catálogo después |
| Aprobación gerente obligatoria | **Planificado** — no bloquea ops hoy |

## Riesgos / deuda técnica

- Texto libre de motivo dificulta análisis.
- Posible desfase lote vs stock si no se elige lote.
- Falta notificación INVENTARIO al gerente.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `002-inventario-almacen` | Contenedor funcional actual |
| `005-gerente-sucursal` | Lectura / futuras notificaciones |
| `001-pos-ventas-caja` | Dominio distinto (venta vs merma) |
| `007-seguridad-usuarios` | Usuario en el registro |
