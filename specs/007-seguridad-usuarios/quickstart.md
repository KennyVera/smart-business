# 007 — Quickstart: seguridad / usuarios

## Arranque local

```bash
docker compose up
```

Seeds: `seed_usuarios`, `crear_gerente_cuenca`.

## Usuarios demo

| Usuario | Clave | Rol |
|---------|-------|-----|
| `admin` | `Admin123` | Administrador |
| `gerente_cuenca` | `Admin123!` | Gerente de Sucursal |
| Cajero / bodeguero | alta en `/usuarios` | Según rol asignado |

## Rutas UI

| Ruta | Uso |
|------|-----|
| `/login` | Entrada |
| `/usuarios` | Maestro + sesiones (admin) |

## Endpoints clave

| Método | Ruta |
|--------|------|
| POST | `/api/usuarios/login/` |
| GET/PATCH | `/api/usuarios/me/` |
| POST | `/api/usuarios/me/change-password/` |
| GET | `/api/usuarios/usuarios/<id>/sesiones/` |
| POST | `/api/usuarios/sesiones/<id>/revocar/` |

## Smoke test

- [ ] Login `admin` / `Admin123` → home admin.
- [ ] Login gerente → `/gerente` con sucursal Cuenca Centro.
- [ ] Crear usuario cajero asignado a sucursal; login OK.
- [ ] Desactivar usuario → no puede autenticarse.
- [ ] Cambio de clave desde menú cuenta.
- [ ] Historial de sesiones Offcanvas; revocar sesión activa.
- [ ] Cajero no accede a `/usuarios`.
- [ ] Foto de perfil se sirve desde `/media/perfiles/`.
