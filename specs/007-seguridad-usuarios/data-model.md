# 007 — Modelo de datos: seguridad / usuarios

Tablas principales en PostgreSQL. Varios modelos `managed = False`.

---

## `rol` → `Rol`

| Campo | Tipo |
|-------|------|
| `id_rol` | PK |
| `nombre` | varchar(50) |
| `descripcion` | varchar |

Roles de negocio: Administrador, Cajero, Bodeguero, Gerente de Sucursal
(normalizado a `gerente` en frontend).

## `usuario` → `Usuario`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id_usuario` | PK | |
| `id_sucursal` | FK null | Obligatoria para gerente |
| `id_rol` | FK | |
| `username` | varchar(50) | |
| `password_hash` | varchar(255) | Legado demo |
| `nombre` / `apellido` | varchar | |
| `email` | varchar null | |
| `foto_perfil` | ImageField | `media/perfiles/` |
| `estado_activo` | bool | Baja lógica |

## `sesion_usuario` → `SesionUsuario`

| Campo | Tipo |
|-------|------|
| `id_sesion` | PK |
| `usuario` | FK |
| `token_sesion` | unique |
| `fecha_inicio` / `fecha_fin` | timestamptz |
| `ip_address` / `user_agent` | auditoría |
| `is_active` | bool |

Revocar sesión: `is_active=False` + `fecha_fin`.
