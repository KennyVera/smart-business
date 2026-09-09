# 004 — Research: multisucursal / geografía

## Contexto de negocio

Cadena retail en Ecuador con presencia por zonas de planificación y cantones.
Cada sucursal tiene terminales POS, stock propio y un gerente acotado. El
mapa organizacional debe permitir abrir/cerrar locales sin romper historial
contable ni kardex.

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Solo lista plana de sucursales | **Rechazado** — se necesita jerarquía zona/cantón |
| Soft-delete vs hard-delete | **Baja lógica** obligatoria |
| Un solo modelo Django managed | **Parcial** — legado `sucursal` sigue `managed = False` en FKs |
| Mapa Leaflet/Google en MVP | **Aplazado** |

## Riesgos / deuda técnica

- Dualismo `geografia.Sucursal` vs `usuarios.SucursalExistente`.
- Sincronización de nombres entre apps (detalle de terminales por nombre).
- Asignación de usuarios a sucursal vive en módulo usuarios, no en ficha geo.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `001` / `002` / `005-gerente` | Filtro por sucursal |
| `007-seguridad-usuarios` | FK usuario → sucursal |
| `005-analitica-estrategia` | KPIs multi-sucursal futuros |
