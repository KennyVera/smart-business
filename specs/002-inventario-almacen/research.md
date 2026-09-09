# 002 — Research: inventario y almacén

## Contexto de negocio

Almacén retail Ecuador: control de SKU, stock por sucursal, lotes con
caducidad y mermas (rotura/vencido). El cobro POS descuenta el mismo stock;
el kardex es la pista de auditoría. IVA 15 % / 0 % vive en el maestro
(`aplica_iva`) y alimenta facturación.

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Stock global único | **Rechazado** — multi-sucursal exige (sucursal, producto) |
| URL de imagen en texto | **Rechazado** — `ImageField` + disco (`media/productos/`) |
| Módulo merma separado en v1 | **Aplazado** — merma operativa vive en inventario; ver `006` |
| CSV masivo en MVP | **Hecho** — import/export de catálogo en UI |

## Riesgos / deuda técnica

- Tablas `managed = False` alineadas al esquema legado.
- FIFO de lotes en venta: sensible a inconsistencias de cantidad lote vs stock.
- Gerente solo lectura: fácil romper RBAC si se reutilizan botones de ops.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `001-pos-ventas-caja` | Descuento stock / kardex `VENTA_POS` |
| `004-multisucursal-geografia` | Sucursales como dimensión de stock |
| `005-gerente-sucursal` | Consultas Alertas/Reportes |
| `006-mermas-auditoria` | Extensión de auditoría de bajas |
| `008-preferencias-usuario` | `filas_por_pagina` en DataGrids |
