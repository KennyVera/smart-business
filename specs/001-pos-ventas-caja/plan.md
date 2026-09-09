# 001 — Plan técnico: POS ventas y caja

## Objetivo de implementación

Cobro atómico en mostrador con IVA Ecuador (15 % / 0 %), vuelto en efectivo,
turno de caja y layout monocromático sin sidebar. Backend en
`backend/apps/pos`; UI en `frontend/src/modules/pos`.

## Stack

| Capa | Tecnología |
|------|------------|
| API | Django + DRF (`/api/pos/`) |
| UI | React + Vite + Bootstrap / React-Bootstrap |
| BD | PostgreSQL (`managed = False` en modelos POS) |
| Entorno | Docker Compose — backend `:8000`, frontend `:5173` |

## Apps / módulos

- `backend/apps/pos` — turnos, catálogo POS, `procesar_venta`, impuestos
- `backend/apps/inventario` — descuento stock / lotes / kardex `VENTA_POS`
- `backend/apps/crm` — cliente opcional en el ticket
- `frontend/src/modules/pos` — `PosLayout`, `useCart`, modales de turno

## Decisiones clave

1. **Layout propio del cajero** (`PosLayout`): sin sidebar; catálogo | ticket.
2. **Transacción atómica** en `POST /api/pos/ventas/procesar/` (`@transaction.atomic`).
3. **IVA por línea** según `Producto.aplica_iva`; UI y backend con `ROUND_HALF_UP`.
4. **Sucursal de la venta** = terminal del turno, no el perfil del usuario.
5. Archivos ≤ 150 líneas (constitución §2.1).

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | UI POS + carrito + catálogo | Hecho |
| B | Cobro atómico + IVA + vuelto | Hecho |
| C | Abrir / cerrar turno mínimo | Hecho |
| D | Arqueo formal por denominación | Pendiente (`tasks.md`) |

## Referencias

- `spec.md` — comportamiento de UI y reglas de cobro
- `data-model.md` — `TurnoCaja`, `Venta`, `VentaDetalle`, pagos
- `tasks.md` — checklist hecho / pendiente
- Constitución §3.3 (cajero), §4.2 (transacción), §4.4 (IVA)
