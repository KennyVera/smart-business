# 001 — Tareas: POS ventas y caja

Leyenda: `[x]` COMPLETADO · `[ ]` PENDIENTE

---

## Completado

- [x] Interfaz monocromática del POS (sin sidebar, catálogo + ticket).
- [x] Lógica del carrito en memoria (`useCart`: altas, tope de stock, cantidades).
- [x] IVA Ecuador 15 % / 0 % según `Producto.aplica_iva` (UI + persistencia).
- [x] Cálculo de cambio en efectivo, bloqueo si falta dinero, payload
      `monto_recibido` / `cambio` y filas en el modal de éxito.
- [x] Cobro atómico `POST /api/pos/ventas/procesar/`.
- [x] Catálogo POS con imagen local e `aplica_iva`.
- [x] Abrir / cerrar turno mínimo (`/api/pos/turnos/` + modales) para poder vender.

## Pendiente

- [ ] Lógica completa de **Apertura / Cierre de turno** (cuadratura formal,
      validación de diferencias, impedimentos de cierre con inconsistencias).
- [ ] **Arqueo de caja** (conteo físico por denominación, comparación contra
      teórico de efectivo, reporte de cierre imprimible).

> Nota para el equipo: ya existe un abrir/cerrar mínimo suficiente para vender.
> Lo pendiente es el ciclo de arqueo y control de caja, no el primer
> “abrir para poder cobrar”.
