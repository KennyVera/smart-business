# 007 — Research: seguridad y usuarios

## Contexto de negocio

ERP multi-sucursal: cada rol ve solo lo necesario (cajero monocromo, gerente
acotado, bodeguero en grillas, admin global). Las sesiones deben poder
auditarse y revocarse. Ecuador no cambia el modelo de roles, pero sí el
contexto fiscal de quien opera.

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Django auth User nativo | **Parcial** — se usa modelo `usuario` legado |
| Solo JWT sin tabla sesión | **Rechazado** — se necesita historial/revocación |
| Permisos objeto DRF finos | **Aplazado** — roles + guards frontend/backend |
| Password hashing bcrypt ya | **Pendiente** — demo aún con hash legado |

## Riesgos / deuda técnica

- `password_hash` en texto plano es riesgo alto fuera de demo.
- Admin sin sucursal vs endpoints gerente.
- Duplicar lógica de normalización de nombres de rol.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| Todos | Auth + RBAC transversal |
| `004` | Asignación sucursal |
| `005-gerente` | Rol gerente + multi-tenant |
| `008` | Preferencias 1:1 con usuario |
