# 002 — Plan técnico: inventario y almacén

## Objetivo de implementación

Maestro de productos, stock por sucursal, lotes/caducidades, mermas operativas,
kardex Offcanvas y reportes PDF/Excel. Backend `backend/apps/inventario`;
UI `frontend/src/modules/inventario`.

## Stack

| Capa | Tecnología |
|------|------------|
| API | Django + DRF (`/api/inventario/`) |
| UI | React + Vite + Bootstrap; Offcanvas; DataGrids |
| PDF | Generación en módulo inventario (`pdf.js` / documento React-PDF) |
| Imágenes | `ImageField` → `media/productos/` |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `backend/apps/inventario` — catálogo, stock, lotes, mermas, alertas, reportes
- `frontend/src/modules/inventario` — Catálogo, Categorías, Stock, Alertas, Reportes
- Consumido por POS (`/api/pos/catalogo/`) y gerente (solo lectura Alertas/Reportes)

## Decisiones clave

1. **Stock por (sucursal, producto)** — multi-tenant de inventario.
2. **Baja lógica** de productos (nunca DELETE físico con historial).
3. **RBAC:** ops (catálogo/stock) = admin + bodeguero; consultas = + gerente.
4. Escritura de merma / alta producto solo si `puedeOperarInventario()`.
5. Archivos ≤ 150 líneas; Kardex en Offcanvas sin salir de la grilla.

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | CRUD productos + imágenes | Hecho |
| B | Stock, lotes, mermas, kardex | Hecho |
| C | Alertas + reportes PDF | Hecho |
| D | Import/export masivo CSV (catálogo) | Hecho |

## Referencias

- `spec.md`, `tasks.md`
- Constitución §3.2 (bodeguero), §4.1 (baja lógica), §4.5 (imágenes)
