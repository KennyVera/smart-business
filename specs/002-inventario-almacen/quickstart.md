# 002 — Quickstart: inventario

## Arranque local

```bash
docker compose up
```

- UI: http://localhost:5173  
- API: http://localhost:8000  
Seed: `python manage.py seed_inventario` (dentro del contenedor backend).

## Usuarios demo

| Usuario | Clave | Qué probar |
|---------|-------|------------|
| `admin` | `Admin123` | Catálogo + Stock + Reportes |
| `gerente_cuenca` | `Admin123!` | Solo Alertas/Reportes (sin merma) |
| Bodeguero (si existe en BD) | — | Ops de almacén |

## Rutas UI

| Ruta | Roles |
|------|-------|
| `/inventario/catalogo` | admin, bodeguero |
| `/inventario/categorias` | admin, bodeguero |
| `/inventario/proveedores` | admin, bodeguero |
| `/inventario/stock` | admin, bodeguero |
| `/inventario/alertas` | admin, gerente, bodeguero |
| `/inventario/reportes` | admin, gerente, bodeguero (tarjeta CRM solo admin/gerente) |

## Endpoints clave

| Ruta | Uso |
|------|-----|
| `/api/inventario/productos/` | CRUD catálogo |
| `/api/inventario/stock/` | Stock por sucursal |
| `/api/inventario/lotes/` | Caducidades |
| `/api/inventario/mermas/` | Baja operativa |
| `/api/inventario/alertas/` | Mínimos / vencimientos |
| `/api/inventario/reportes/` | Datos para PDF/Excel |

## Smoke test

- [ ] Login admin → Catálogo lista productos con imagen `/media/`.
- [ ] Alta/edición producto con `aplica_iva` y margen estimado en UI.
- [ ] Stock muestra cantidad y mínimo; fila crítica resaltada.
- [ ] Registrar merma desde Stock → stock baja + kardex `MERMA`.
- [ ] Offcanvas Kardex muestra movimientos recientes.
- [ ] Gerente en `/inventario/catalogo` → Acceso denegado + redirect.
- [ ] Generar reporte PDF en `/inventario/reportes`.
- [ ] Alertas: stock bajo / caducidad visibles.
