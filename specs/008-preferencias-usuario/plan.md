# 008 — Plan técnico: preferencias de usuario

## Objetivo de implementación

Preferencias **individuales** de apariencia y densidad (sidebar, gráficos,
confirmaciones, logo, filas/página). Backend en `apps.usuarios`
(`PreferenciaUsuario`); frontend `PreferencesContext` + `ModalApariencia`.

## Stack

| Capa | Tecnología |
|------|------------|
| API | DRF `GET/PATCH /api/usuarios/preferencias/me/` |
| UI | React Context + modal Bootstrap |
| Media | `ImageField` logos → `media/logos_usuarios/` |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `backend/apps/usuarios/models_preferencias.py` (+ serializers/views/signal)
- `frontend/src/context/PreferencesContext.jsx`
- Consumidores: Sidebar, Header, recharts, `confirm()`, DataGrids

## Decisiones clave

1. 1:1 con usuario; `get_or_create` en GET; signal al crear usuario.
2. Sin preferencias globales de empresa en este módulo.
3. `color_logs` independiente de `color_graficos` (confirmaciones).
4. Solo `request.user` — sin ID en URL.
5. Defaults: sidebar `#000000`, gráficos/logs `#00AA5D`, filas `10`.

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | Modelo + API + signal | Hecho |
| B | Context + Modal Apariencia | Hecho |
| C | Aplicar a sidebar/header/charts/paginación/confirm | Hecho |

## Referencias

- `spec.md`, `data-model.md`, `tasks.md`
- Constitución §3.1 (preferencias admin)
