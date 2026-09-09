# 005 — Tareas Gerente de Sucursal

## Backend

- [x] Spec + data-model + constitución §3.4 / §2.3 / §4.3
- [x] `crear_gerente_cuenca` (rol, sucursal, usuario)
- [x] Campos `venta.anulada`, `turno_caja.auditado` + migración
- [x] `POST /api/pos/ventas/<id>/anular/` atómico multi-tenant
- [x] `GerenteReportesViewSet` (auditoría, auditar, cierre, dashboard)
- [x] Permiso `EsGerenteSucursal` + normalización del nombre de rol

## Frontend

- [x] `rolDeSesion` normaliza “Gerente de Sucursal” → `gerente`
- [x] Rutas `/gerente`, `/gerente/auditoria`, `/gerente/devoluciones`
- [x] Sidebar ítems del gerente + acento `#00AA5D`
- [x] Dashboard con recharts (hora + top 5)
- [x] Auditoría con colores de descuadre + marcar auditado
- [x] Filtros Desde/Hasta (default 7 días) + ícono Eye
- [x] OffcanvasDetalleTurno (desglose + auditar al final)
- [x] Devoluciones: buscar ticket + confirmar anulación
- [x] API client con Bearer (ya en `api/client.js`)

## Backend auditoría (ampliación)

- [x] Query `fecha_inicio` / `fecha_fin` en listado
- [x] `GET .../auditoria-cajas/<id>/desglose/`

## Notificaciones (campanita)

- [x] Modelo `Notificacion` + migración
- [x] `GET /api/notificaciones/` y `POST .../<id>/leer/`
- [x] Signal `TurnoCaja` → gerentes de sucursal si hay descuadre
- [x] Dropdown Bell en Header con badge rojo

## RBAC frontend

- [x] `rbac.js` + menú agrupado en Sidebar
- [x] Rutas protegidas por módulo (ops vs gerencial vs consultas)
- [x] Toast Acceso denegado
- [x] Ocultar merma en Alertas si no puede operar inventario

## CRM analítico (clientes de sucursal)

- [x] `GerenteClienteViewSet` en `/api/pos/gerente/clientes/` (+ CRM mirror)
- [x] Listado con annotations, detalle 360°, PATCH contacto, export CSV
- [x] Query `reporte`: top_gastos, top_frecuentes, riesgo_abandono, cumpleaños
- [x] UI selector en `ClientesList` + resalte rojo en abandono + CSV filtrado
- [x] `GET /api/crm/reportes/clientes/` + tarjeta en Reportes operativos (PDF html2pdf)
