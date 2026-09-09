# 008 — Quickstart: preferencias

## Arranque local

```bash
docker compose up
```

Login autenticado (cualquier rol con layout admin/gerente o menú cuenta).

## Usuarios demo

| Usuario | Clave | Nota |
|---------|-------|------|
| `admin` | `Admin123` | Cambiar sidebar/gráficos |
| `gerente_cuenca` | `Admin123!` | Preferencias propias, no afectan a admin |
| Cajero | — | Menú cuenta en topbar POS (si expuesto) |

## Rutas / UI

| Entrada | Uso |
|---------|-----|
| Menú cuenta → **Apariencia y configuración** | `ModalApariencia` |
| Sidebar / Header / tablas | Aplicación en vivo |

## Endpoints clave

| Método | Ruta |
|--------|------|
| GET | `/api/usuarios/preferencias/me/` |
| PATCH | `/api/usuarios/preferencias/me/` (multipart si hay logo) |

## Smoke test

- [ ] GET preferencias crea defaults si no existían.
- [ ] Cambiar `color_sidebar` → sidebar se actualiza sin reload.
- [ ] Cambiar `color_graficos` → charts recharts usan el color.
- [ ] Cambiar `color_logs` → modal `confirmar()` usa ese acento.
- [ ] Subir logo → aparece en Header; quitar → cuadrado verde.
- [ ] `filas_por_pagina` 25 → listados admin paginan a 25.
- [ ] Dos usuarios distintos mantienen colores independientes.
- [ ] PATCH sin autenticación → 401.
