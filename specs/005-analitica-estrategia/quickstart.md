# 005 — Quickstart: analítica admin

## Arranque local

```bash
docker compose up
```

Login como administrador → home `/`.

## Usuarios demo

| Usuario | Clave | Resultado |
|---------|-------|-----------|
| `admin` | `Admin123` | Ve `AdminDashboardPage` |
| `gerente_cuenca` | `Admin123!` | Redirige a `/gerente` (no este panel) |
| Cajero | — | Redirige a `/pos` |

## Rutas UI

| Ruta | Uso |
|------|-----|
| `/` | Dashboard estratégico admin |

## Endpoints clave

| Método | Ruta |
|--------|------|
| GET | `/api/usuarios/sesiones/resumen/` |
| GET | `/api/pos/gerente/dashboard/` (referencia; es por sucursal) |

## Smoke test

- [ ] Login `admin` aterriza en dashboard con 4 tarjetas KPI.
- [ ] KPI Sesiones muestra total / activas (API real).
- [ ] Gráfico de líneas renderiza sin error de consola.
- [ ] Cambio de `color_graficos` en Apariencia tiñe el chart.
- [ ] Gerente no ve este home (va a `/gerente`).
- [ ] Cajero no ve sidebar admin.
- [ ] Responsive básico: tarjetas apiladas en viewport estrecho.
- [ ] Sin 500 en red al cargar `/`.
