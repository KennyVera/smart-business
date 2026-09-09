# 006 — Mermas y auditoría de almacén

**Estado:** parcial (merma operativa en inventario; auditoría dedicada y
reportes de merma avanzados pendientes).  
**Apps:** `backend/apps/inventario` (`RegistroMerma`, kardex `MERMA`);
UI en `frontend/src/modules/inventario`.  
**Roles escritura:** `bodeguero`, `administrador`. Gerente: sin botón merma.

---

## 1. Objetivo

Registrar bajas de inventario (rotura, vencido, merma de proceso) con motivo,
usuario y sucursal; descontar stock de forma atómica y dejar rastro en kardex.
Complementar con vistas de auditoría (quién, cuándo, por qué) y exportes.

## 2. Flujo actual

1. Desde Stock o Alertas, el operador abre `MermaFormModal`.
2. `POST /api/inventario/mermas/` con producto, sucursal, cantidad, motivo.
3. Backend descuenta `inventario_stock` y escribe `HistorialMovimiento` tipo
   `MERMA`.
4. Kardex Offcanvas refleja el movimiento.

## 3. Fuera de alcance de la merma operativa

- Anulación de venta (eso es `005-gerente` / `DEVOLUCION_POS`).
- Ajuste ciego sin motivo.
- Workflow de aprobación multinivel (planificado).

## 4. API

| Método | Ruta |
|--------|------|
| GET | `/api/inventario/mermas/` |
| POST | `/api/inventario/mermas/` |
| GET | `/api/inventario/alertas/` (contexto caducidad/crítico) |

Ver `tasks.md` para panel de auditoría dedicado.
