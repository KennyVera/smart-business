# 007 — Plan técnico: seguridad y usuarios

## Objetivo de implementación

Identidad, roles, sesiones y RBAC de navegación. Backend
`backend/apps/usuarios`; UI `frontend/src/modules/usuarios` + guards en
`App.jsx` / `layout`.

## Stack

| Capa | Tecnología |
|------|------------|
| API | Django + DRF (`/api/usuarios/`) |
| Auth | Token/sesión propia + Bearer en cliente |
| UI | React + Vite + Bootstrap |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `backend/apps/usuarios` — modelos, auth, sesiones, perfil, preferencias
- `frontend/src/modules/usuarios` — login, CRUD, historial, menú cuenta
- `frontend/src/modules/usuarios/rbac.js` — matriz de roles

## Decisiones clave

1. Roles de negocio en tabla `rol` (no solo flags Django).
2. Multi-tenant: gerente con sucursal obligatoria.
3. Baja lógica de usuarios.
4. Sesiones auditables y revocables desde admin.
5. Preferencias individuales delegadas a spec `008`.

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | Login + CRUD + RBAC UI | Hecho |
| B | Sesiones + perfil + foto | Hecho |
| C | Hardening (hash, 2FA, lockout) | Pendiente |

## Referencias

- `spec.md`, `data-model.md`, `tasks.md`
- Constitución §2.2, §3.5
