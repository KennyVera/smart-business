# 001 — Research: POS ventas y caja

## Contexto de negocio

Retail multi-sucursal en Ecuador. Facturación de mostrador con **IVA 15 %**
(gravado) y **tarifa 0 %** (canasta básica). El cajero opera turnos largos:
la UI debe ser monocromática, sin menú lateral, y el cobro no puede dejar
ventas “a medias” (stock sin ticket o viceversa).

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Reutilizar layout admin en POS | **Rechazado** — fatiga visual y ruido de menú |
| Soft-delete de facturas | **Rechazado** — se anula (`anulada=True`), no DELETE |
| Calcular IVA solo en backend | **Parcial** — se calcula en `useCart` y se valida en servidor |
| Arqueo por denominación en v1 | **Aplazado** — basta abrir/cerrar + descuadre |

## Riesgos / deuda técnica

- Modelos POS `managed = False`: cambios de columna requieren
  `SeparateDatabaseAndState` + SQL cuidadoso.
- Arqueo formal y reporte de cierre imprimible aún pendientes (`tasks.md`).
- Dependencia fuerte del catálogo e inventario en el mismo instante del cobro
  (bloqueo pesimista de stock).

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `002-inventario-almacen` | Stock, lotes, kardex `VENTA_POS` |
| `003-clientes-fidelizacion` | ID cliente en ticket / registro exprés |
| `005-gerente-sucursal` | Auditoría de descuadre, anulación |
| `007-seguridad-usuarios` | JWT, rol `cajero`, sesión |
