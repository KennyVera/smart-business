# 006 — Quickstart: mermas

## Arranque local

```bash
docker compose up
```

Seed inventario + login bodeguero/admin.

## Usuarios demo

| Usuario | Clave | Esperado |
|---------|-------|----------|
| `admin` | `Admin123` | Puede registrar merma |
| `gerente_cuenca` | `Admin123!` | Sin botón merma |
| Bodeguero | — | Flujo principal de ops |

## Rutas UI

| Ruta | Acción |
|------|--------|
| `/inventario/stock` | Icono merma por fila |
| `/inventario/alertas` | Merma en críticos (si ops) |
| `/inventario/reportes` | Contexto de auditoría general |

## Endpoints clave

| Método | Ruta |
|--------|------|
| GET/POST | `/api/inventario/mermas/` |
| GET | `/api/inventario/stock/` |
| GET | producto kardex (vía endpoints inventario existentes) |

## Smoke test

- [ ] Admin abre Stock → registrar merma con motivo.
- [ ] Cantidad baja en stock de esa sucursal.
- [ ] Kardex muestra movimiento `MERMA`.
- [ ] Merma con cantidad > stock → error de validación.
- [ ] Gerente no ve acción merma en Alertas.
- [ ] Listado GET mermas devuelve el registro nuevo.
- [ ] Motivo vacío rechazado.
- [ ] PDF de reportes sigue generando tras una merma.
