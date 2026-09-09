# 004 — Multisucursal y geografía

**Estado:** parcial (CRUD geográfico operativo; mapa territorial avanzado pendiente).  
**Apps:** `backend/apps/geografia`, `frontend/src/modules/geografia`.  
**Roles:** `administrador`.

---

## 1. Objetivo

Administrar la jerarquía territorial del negocio (zona → subzona → cantón →
sucursal) y mantener sucursales activas/inactivas sin borrar historial. La
sucursal es el eje multi-tenant de stock, terminales POS y gerentes.

## 2. Superficie de UI

| Ruta | Página |
|------|--------|
| `/geografia/zonas` | Árbol / listado de zonas, subzonas y cantones |
| `/geografia/sucursales` | Maestro de sucursales + detalle Offcanvas |

Layout admin: sidebar oscuro + header blanco. Baja lógica: `activa=False`
(o `estado_activa` en tabla legada sincronizada).

## 3. API

Prefijo `/api/geografia/`:

| Recurso | ViewSet |
|---------|---------|
| `zonas/` | `ZonaPlanificacionViewSet` |
| `subzonas/` | `SubzonaViewSet` |
| `cantones/` | `CantonDistritoViewSet` |
| `sucursales/` | `SucursalViewSet` (+ detalle con terminales) |

## 4. Reglas

1. No `DELETE` físico de sucursales con historial (constitución §4.1).
2. El gerente opera solo su `request.user.sucursal` (consumo en otros módulos).
3. Seed: `python manage.py seed_geografia`.

## 5. Fuera de alcance (ver `tasks.md`)

Mapa interactivo, asignación masiva de personal y sincronización bidireccional
completa con tablas legadas fuera del app `geografia`.
