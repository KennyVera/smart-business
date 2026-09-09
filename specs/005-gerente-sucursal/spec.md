# 005 — Gerente de Sucursal

**Estado:** implementado (auditoría con filtros + desglose)  
**Roles:** `Gerente de Sucursal` (clave de sesión: `gerente`).  
**Sucursal de demo:** Cuenca Centro (`gerente_cuenca` / `Admin123!`).

---

## Objetivo

Dar al gerente de una sucursal un panel operativo propio: rendimiento del día,
auditoría de descuadres de caja y autorización de devoluciones/anulaciones,
**sin ver datos de otras sucursales**.

## Multi-tenant (regla crítica)

1. El usuario gerente **debe** tener `id_sucursal` obligatorio.
2. Cada endpoint de `/api/pos/gerente/*` filtra por
   `request.user.sucursal_id`.
3. Anular factura: solo si
   `venta.turno.terminal.sucursal_id == request.user.sucursal_id`.
4. El frontend envía `Authorization: Bearer <token>`; el backend resuelve
   `request.user` vía JWT.

## RBAC de navegación (frontend)

| Módulo | Menú / rutas | Roles |
|--------|--------------|-------|
| Gerencial | Dashboard, Auditoría, Devoluciones | admin, gerente |
| Inventario ops | Catálogo, Categorías, Stock | admin, bodeguero |
| Consultas | Alertas, Reportes | admin, gerente, bodeguero |

Forzar URL prohibida → toast **Acceso denegado** + redirect al home del rol
(`RequireRol` + `rbac.js`). En Alertas, el gerente **no** ve acciones de merma.
## Pantallas

| Ruta | Página | Contenido |
|------|--------|-----------|
| `/gerente` | Dashboard | Título con nombre de sucursal, LineChart ventas/hora, BarChart top 5 |
| `/gerente/auditoria` | Auditoría de cajas | Filtros Desde/Hasta, tabla, Eye → Offcanvas desglose |
| `/gerente/devoluciones` | Devoluciones | Buscar ticket, detalle, anular con confirmación |

Layout: **sidebar oscuro + header blanco**, acento `#00AA5D` (igual que admin,
distinto del POS monocromático). Offcanvas de auditoría sigue el patrón del
Kardex de inventario.

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pos/gerente/auditoria-cajas/` | Turnos cerrados. Query: `fecha_inicio`, `fecha_fin` (default 7 días). Orden: mayor descuadre |
| GET | `/api/pos/gerente/auditoria-cajas/<id>/desglose/` | Desglose financiero del turno |
| POST | `/api/pos/gerente/auditoria-cajas/<id>/auditar/` | `auditado=True` |
| GET | `/api/pos/gerente/cierre-diario/` | Totales de hoy (IVA 15 % / 0 % / IVA / total) |
| GET | `/api/pos/gerente/dashboard/` | Ventas por hora, top 5 productos, ventas por cajero |
| POST | `/api/pos/ventas/<id>/anular/` | Devolución atómica + restock en la sucursal |
| GET | `/api/notificaciones/` | Últimas notificaciones del usuario autenticado |
| POST | `/api/notificaciones/<id>/leer/` | Marca una notificación como leída |

### Desglose de turno (payload)

- Resumen: cajero, caja, fechas, `auditado`
- Efectivo: apertura, ventas efectivo, esperado, real, descuadre
- Otros: tarjeta, transferencia, otros
- `tickets`: últimas 5 ventas no anuladas del turno

### Notificaciones (campanita)

Al cerrar un `TurnoCaja` con `descuadre ≠ 0`, un signal crea avisos tipo
`CAJA` para todos los usuarios activos de esa sucursal con rol gerente.
El header muestra badge rojo con no leídas; al clic se marca `leida=true`.

## Criterios de aceptación

- [x] `crear_gerente_cuenca` deja listo el usuario de prueba en Cuenca Centro.
- [x] El gerente no obtiene turnos/ventas de otra sucursal.
- [x] Dashboard muestra el nombre real de la sucursal.
- [x] Faltante (< 0) en rojo; sobrante (> 0) en naranja.
- [x] Anular restockea y marca `anulada`; segunda anulación falla.
- [x] Archivos ≤ 150 líneas; gráficos en `components/charts/`.
- [x] Auditoría filtra por rango de fechas (default 7 días).
- [x] Fechas acotadas: máx. hoy, mín. 2 años atrás, Desde ≤ Hasta.
- [x] Offcanvas muestra desglose y permite marcar auditado.
- [x] Campanita con badge, lista y marcar leída; signal de descuadre.
- [x] RBAC sidebar: gerente sin Catálogo/Categorías/Stock.
- [x] `RequireRol` + toast Acceso denegado al forzar URL.
- [x] Alertas compartidas sin botón de merma para gerente.
