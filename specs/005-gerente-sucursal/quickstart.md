# 005 — Quickstart: gerente de sucursal

## Arranque local

```bash
docker compose up
```

En backend: `python manage.py crear_gerente_cuenca`.

## Usuarios demo

| Usuario | Clave | Sucursal |
|---------|-------|----------|
| `gerente_cuenca` | `Admin123!` | Cuenca Centro |
| `admin` | `Admin123` | Puede ver menú gerencial |
| Cajero de la misma sucursal | — | Genera turnos/descuadres |

## Rutas UI

| Ruta | Página |
|------|--------|
| `/gerente` | Dashboard (nombre de sucursal) |
| `/gerente/auditoria` | Filtros + tabla + Offcanvas |
| `/gerente/devoluciones` | Buscar ticket y anular |

## Endpoints clave

| Método | Ruta |
|--------|------|
| GET | `/api/pos/gerente/dashboard/` |
| GET | `/api/pos/gerente/auditoria-cajas/?fecha_inicio=&fecha_fin=` |
| GET | `/api/pos/gerente/auditoria-cajas/<id>/desglose/` |
| POST | `/api/pos/gerente/auditoria-cajas/<id>/auditar/` |
| POST | `/api/pos/ventas/<id>/anular/` |
| GET/POST | `/api/notificaciones/` · `.../<id>/leer/` |

## Smoke test

- [ ] Login `gerente_cuenca` → título con “Cuenca Centro”.
- [ ] Dashboard: ventas/hora y top productos (recharts).
- [ ] Auditoría: default 7 días; faltante rojo / sobrante naranja.
- [ ] Eye → Offcanvas desglose; marcar auditado.
- [ ] Anular ticket de su sucursal → restock; segunda anulación falla.
- [ ] Intentar datos de otra sucursal → 403.
- [ ] Cierre con descuadre ≠ 0 → campanita CAJA.
- [ ] URL `/inventario/catalogo` → Acceso denegado.
