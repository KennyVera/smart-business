# 001 — Quickstart: POS

## Arranque local

```bash
docker compose up
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Vite proxy: `/api` y `/media` → backend

Seeds útiles: `seed_pos`, `seed_inventario`, `seed_usuarios`.

## Usuarios demo

| Usuario | Clave | Rol |
|---------|-------|-----|
| `admin` | `Admin123` | Administrador (puede abrir POS) |
| `gerente_cuenca` | `Admin123!` | Gerente (Cuenca Centro) |
| usuario con rol **cajero** | (seed / alta en Usuarios) | Cajero |

## Rutas UI

| Ruta | Uso |
|------|-----|
| `/login` | Autenticación |
| `/pos` | Workspace de venta (RequireRol POS) |

## Endpoints clave

| Método | Ruta |
|--------|------|
| GET | `/api/pos/turnos/actual/` |
| POST | `/api/pos/turnos/abrir/` / `cerrar/` |
| GET | `/api/pos/catalogo/` |
| POST | `/api/pos/ventas/procesar/` |

## Smoke test

- [ ] Login con rol de venta y redirección a `/pos` (o acceso vía topbar).
- [ ] Abrir turno en terminal de la sucursal.
- [ ] Agregar producto con IVA 15 % y otro tarifa 0; totales coinciden.
- [ ] Efectivo insuficiente → botón Finalizar deshabilitado.
- [ ] Efectivo ≥ total → 201, modal con recibido/cambio, stock baja.
- [ ] Tarjeta/transferencia → recibido = total, cambio $0.
- [ ] Cerrar turno: aparece esperado / real / descuadre.
- [ ] Sin turno abierto no se puede finalizar venta.
