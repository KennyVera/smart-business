# 007 — Seguridad y usuarios

**Estado:** parcial (login JWT/sesión, CRUD usuarios, roles, historial de
sesiones, perfil y cambio de clave; endurecimiento 2FA / políticas avanzadas
pendiente).  
**Apps:** `backend/apps/usuarios`, `frontend/src/modules/usuarios`.  
**Roles:** administración de usuarios = `administrador`.

---

## 1. Objetivo

Gestionar identidad: roles, alta/baja lógica de usuarios, asignación a
sucursal, autenticación, sesiones auditables, perfil (foto) y cambio de clave.
El frontend aplica RBAC de navegación (`rbac.js`, `RequireRol`).

## 2. Superficie de UI

| Ruta | Uso |
|------|-----|
| `/login` | Autenticación |
| `/usuarios` | Maestro admin + Offcanvas historial de sesiones |
| Menú cuenta | Perfil, cambio de clave, Apariencia (`008`) |

## 3. API principal

| Método | Ruta |
|--------|------|
| POST | `/api/usuarios/login/` · `logout/` |
| GET/PATCH | `/api/usuarios/me/` |
| POST | `/api/usuarios/me/change-password/` |
| CRUD | `/api/usuarios/usuarios/` · `/api/usuarios/roles/` |
| GET | `/api/usuarios/usuarios/<id>/sesiones/` |
| GET | `/api/usuarios/sesiones/resumen/` |
| POST | `/api/usuarios/sesiones/<id>/revocar/` |

## 4. Reglas

1. Baja lógica: `estado_activo=False` (no DELETE físico).
2. Gerente exige `id_sucursal`.
3. Claves validadas contra `password_hash` (texto plano en legado demo).
4. Seed: `seed_usuarios` → `admin` / `Admin123`.

## 5. Fuera de alcance (ver `tasks.md`)

2FA, SSO, políticas de complejidad enterprise, bloqueo por intentos.
