# 004 — Quickstart: geografía

## Arranque local

```bash
docker compose up
```

Seed: `python manage.py seed_geografia`.

## Usuarios demo

| Usuario | Clave | Rol |
|---------|-------|-----|
| `admin` | `Admin123` | Administrador (acceso a geografía) |
| `gerente_cuenca` | `Admin123!` | Sin menú de zonas/sucursales |

## Rutas UI

| Ruta | Uso |
|------|-----|
| `/geografia/zonas` | Jerarquía territorial |
| `/geografia/sucursales` | Maestro + detalle |

## Endpoints clave

| Método | Ruta |
|--------|------|
| GET/POST | `/api/geografia/zonas/` |
| GET/POST | `/api/geografia/subzonas/` |
| GET/POST | `/api/geografia/cantones/` |
| GET/PATCH | `/api/geografia/sucursales/` |

## Smoke test

- [ ] Login `admin` → menú Administración muestra Zonas y Sucursales.
- [ ] Listar zonas y expandir subzonas/cantones.
- [ ] Crear o editar sucursal (dirección, teléfono).
- [ ] Desactivar sucursal: no desaparece el historial relacionado.
- [ ] Offcanvas detalle: terminales de la sucursal.
- [ ] `gerente_cuenca` no ve rutas de geografía (RequireRol).
- [ ] Forzar URL `/geografia/zonas` como gerente → Acceso denegado.
- [ ] Sucursal “Cuenca Centro” existe para demos de gerente/POS.
