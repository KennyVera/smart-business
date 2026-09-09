# 008 — Preferencias de usuario individuales

**Estado:** implementado  
**Roles:** todos los autenticados (admin, gerente, bodeguero, cajero).  
**Alcance:** personalización de UI administrativa **por usuario**, sin afectar a
otros.

---

## Objetivo

Permitir que cada usuario configure apariencia y densidad de tablas
(sidebar, gráficos, logo, filas por página) y que esos valores se apliquen
inmediatamente en la sesión.

## Reglas

1. Preferencias **1:1** con `Usuario` (`PreferenciaUsuario`).
2. Al crear un usuario se crean preferencias por defecto (`post_save`).
3. `GET/PATCH` solo sobre `request.user` — sin ID en la URL.
4. No hay preferencias globales de empresa en este módulo.

## Defaults

| Campo | Valor |
|-------|--------|
| `color_sidebar` | `#000000` |
| `color_graficos` | `#00AA5D` |
| `color_logs` | `#00AA5D` (confirmaciones / avisos) |
| `logo_personalizado` | `null` |
| `filas_por_pagina` | `10` (opciones: 10, 25, 50, 100) |

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios/preferencias/me/` | Preferencias del autenticado (`get_or_create`) |
| PATCH | `/api/usuarios/preferencias/me/` | Actualiza colores, logo (`multipart`) y filas |

## Frontend

- Contexto: `src/context/PreferencesContext.jsx` + `usePreferences()` /
  `useFilasPorPagina()`.
- Provider bajo rutas autenticadas (`PreferencesLayout` en `App.jsx`).
- Menú cuenta → **Apariencia y configuración** (`ModalApariencia`).
- Aplica a: Sidebar (`colorSidebar`), Header (logo), recharts
  (`colorGraficos`), confirmaciones (`colorLogs`), DataGrids (`filasPorPagina`).

## Criterios de aceptación

1. Dos usuarios pueden tener colores de sidebar distintos a la vez.
2. Guardar preferencias no requiere recargar la página.
3. Logo personalizado aparece en el header; si es nulo, cuadrado verde.
4. Cambiar filas por página afecta listados paginados del admin.
