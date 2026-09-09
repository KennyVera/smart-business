# Constitución de Smart Business

Documento rector para el ERP/POS/CRM multi-sucursal de retail en Ecuador.
Todo cambio de código, API o interfaz debe respetar estas reglas. Si una
historia de usuario las contradice, se actualiza primero esta constitución.

**Versión:** 1.6  
**Vigencia:** 2026-09-09  
**Alcance:** `backend/`, `frontend/`, `specs/`

---

## 1. Stack tecnológico

| Capa | Tecnología | Notas |
|------|------------|--------|
| Backend | Django + Django REST Framework | API JSON bajo `/api/`. Apps por dominio. |
| Frontend | React + Vite + Bootstrap / React-Bootstrap | SPA. Un módulo por bounded context. |
| Gráficos | **recharts** | Dashboards admin y gerente. |
| Base de datos | PostgreSQL (`requeson_erp_db`) | Esquema existente. Varios modelos Django son `managed = False`. |
| Archivos | `ImageField` → `MEDIA_ROOT` (`backend/media/`) | Fotos reales en disco, servidas en `/media/`. |
| Entorno | Docker Compose | Backend `:8000`, frontend `:5173`. Postgres en el host. |

No se introduce otro framework de UI, ORM o motor de BD sin actualizar esta
constitución. El proxy de Vite reenvía `/api` y `/media` al backend.

---

## 2. Arquitectura (Domain-Driven Design)

El backend se parte en **apps** y el frontend las refleja en
`frontend/src/modules/`. Cada módulo posee `pages/`, `components/` y
servicios/API propios. No se mezclan bounded contexts.

| Dominio | Backend | Frontend |
|---------|---------|----------|
| Geografía / sucursales | `apps.geografia` | `src/modules/` (panel admin) |
| Identidad y roles | `apps.usuarios` | `src/modules/usuarios` + `src/context/` (preferencias) |
| Inventario y kardex | `apps.inventario` | `src/modules/inventario` |
| Punto de venta | `apps.pos` | `src/modules/pos` |
| Gerente de sucursal | `apps.pos` (reportes / anulación) | `src/modules/gerente` |
| Clientes / fidelización | `apps.crm` | POS (registro exprés) + futuro módulo CRM |

### 2.1 Límites de archivo (obligatorio)

Está **estrictamente prohibido** crear o dejar crecer archivos monolíticos de
más de **150 líneas**. Si un componente, vista o servicio se acerca al tope:

1. Extraer subcomponentes, hooks o servicios con un solo motivo.
2. Mantener el archivo orquestador delgado (props in, eventos out).
3. No “esconder” complejidad pegando lógica en el mismo JSX/Python.

### 2.2 Contratos HTTP

- Prefijo de dominio: `/api/usuarios/`, `/api/inventario/`, `/api/pos/`, `/api/crm/`,
  `/api/notificaciones/`.
- El cajero vende con `POST /api/pos/ventas/procesar/`.
- El gerente anula con `POST /api/pos/ventas/<id>/anular/`.
- Reportes de sucursal: `/api/pos/gerente/auditoria-cajas/`,
  `/api/pos/gerente/cierre-diario/`, `/api/pos/gerente/dashboard/`.
- Notificaciones in-app: `GET /api/notificaciones/`,
  `POST /api/notificaciones/<id>/leer/`.
- Perfil del autenticado: `GET/PATCH /api/usuarios/me/`,
  `POST /api/usuarios/me/change-password/` (valida `password_hash` en texto plano).
  `PATCH` acepta `foto_perfil` (ImageField → `media/perfiles/`).
- Preferencias individuales: `GET/PATCH /api/usuarios/preferencias/me/`
  (sidebar, gráficos, logo, `filas_por_pagina`). Spec: `008-preferencias-usuario`.
- El CRM de mostrador usa `GET/POST /api/crm/clientes/`.
- Permisos por rol (`cajero`, `bodeguero`, `administrador`,
  `gerente` / `Gerente de Sucursal`).
  El POS exige rol de venta; el inventario, rol de almacén, gerente o admin.

### 2.3 Multi-tenant por sucursal (obligatorio)

El gerente **solo** opera sobre `request.user.sucursal`. Toda consulta de
turnos, ventas o stock del módulo gerente filtra por
`terminal__sucursal=request.user.sucursal` (o la FK equivalente). Anular una
factura de otra sucursal es **error 403**, aunque el folio exista.

Usuario de prueba: `gerente_cuenca` / `Admin123!` → sucursal **Cuenca Centro**.

---

## 3. Reglas de interfaz (UI/UX por rol)

La identidad visual **no es cosmética**: cada rol tiene una carga cognitiva
distinta. No se reutiliza el layout del administrador en el POS ni al revés.

### 3.1 Administrador

- Layout clásico: **sidebar oscuro**, **header blanco**, área de trabajo con
  dashboard de tarjetas y gráficos.
- Paleta corporativa suave. Acento de marca: verde **`#00AA5D`**.
- Navegación amplia (sucursales, usuarios, inventario, reportes, panel) en
  **grupos colapsables** (Administración, Gerencial, Inventario, Consultas).
  El grupo de la ruta activa se abre solo; “Cerrar sesión” queda fijo abajo.
- **Preferencias individuales** (no globales): color de sidebar, color de
  gráficos, logo del header y filas por página. UI en el menú de cuenta
  (“Apariencia y configuración”). Spec `008-preferencias-usuario`.
- Confirmaciones del sistema: modal propio (`confirmar()`), **nunca**
  `window.confirm`; acento con `color_logs` del usuario (independiente de
  `color_graficos`).
### 3.2 Bodeguero

- Uso intensivo de **DataGrids** (tablas), filtros masivos y paginación.
- Modales **Offcanvas** para Kardex y detalle operativo.
- Reportes exportables a **PDF** y **Excel**.
- Prioridad: stock, lotes, caducidades, mermas, no el cobro.
- Sidebar: **Inventario** (Catálogo, Categorías, Stock) + consultas compartidas
  (Alertas, Reportes). **Sin** módulo Gerencial ni administración global.

### 3.3 Cajero (POS)

- Diseño **ultra-rápido**. Paleta **estrictamente monocromática** (blanco y
  negro) para reducir fatiga visual en turnos largos.
- **Sin menú lateral.** `PosLayout` + topbar.
- Interfaz partida: **catálogo a la izquierda**, **ticket a la derecha**.
- El cajero no ve Productos / Reportes / Panel en el topbar.
- Flujos de mostrador (registro exprés, vuelto) viven en el ticket, no en
  pantallas que saquen al cajero de la venta.

### 3.4 Gerente de Sucursal

- Reutiliza el **layout administrativo** (sidebar oscuro + header blanco) con
  acento **`#00AA5D`**. No usa el layout monocromático del POS.
- Módulo `src/modules/gerente/`: Dashboard, Auditoría de cajas, Devoluciones.
- El título del dashboard incluye el **nombre de su sucursal**
  (ej. “Rendimiento - Cuenca Centro”).
- Gráficos con **recharts** (ventas por hora, top productos).
- Descuadre: faltante en rojo, sobrante en naranja.
- Auditoría de cajas: filtros históricos `fecha_inicio` / `fecha_fin`
  (default últimos 7 días; **máx. hoy**, **mín. 2 años atrás**, Desde ≤ Hasta)
  y **Offcanvas** de desglose financiero del turno (mismo patrón visual que el
  Kardex). “Marcar como Auditado” vive en el panel.
- **Campanita** del header: dropdown con notificaciones del usuario
  (badge rojo con no leídas). Un cierre de caja con descuadre ≠ 0 genera
  aviso tipo `CAJA` a los gerentes de esa sucursal (signal `post_save` de
  `TurnoCaja`).
- **Menú de cuenta** universal (`UserProfileDropdown`): trigger elegante
  (nombre + rol + avatar/iniciales); opciones Mi perfil (con foto), Cambio de
  clave y Cerrar sesión. Misma pieza en header admin/gerente y topbar POS.
- Sidebar gerencial + **Alertas/Reportes** (solo lectura). **No** ve Catálogo,
  Categorías ni Stock operativos; forzar URL → toast “Acceso denegado” y
  redirección a `/gerente`.
- Solo ve menú de su dominio + consultas compartidas; no administra
  zonas/usuarios globales.

### 3.5 RBAC de navegación (frontend)

El rol se guarda en sesión (`rol_nombre` del login) y se normaliza con
`rolDeSesion()` / `rbac.js`. El sidebar y las rutas usan `RequireRol`:

| Módulo | Rutas | Roles |
|--------|-------|-------|
| Administración | zonas, sucursales, usuarios, dashboard admin | administrador |
| Gerencial | `/gerente/*` | administrador, gerente |
| Inventario ops | catálogo, categorías, stock | administrador, bodeguero |
| Consultas | alertas, reportes | administrador, gerente, bodeguero |

En vistas compartidas, acciones de escritura (merma, nuevo producto, lote)
solo si `puedeOperarInventario()`.

---

## 4. Reglas críticas de negocio

### 4.1 Baja lógica (nunca DELETE físico)

En entidades clave (**sucursales**, **usuarios**, **productos** y equivalentes
operativos) **no se ejecuta `DELETE` físico**. Se desactiva el registro
(`is_active=False` / `estado_activo=False` / `estado_activa=False` según la
tabla). El historial de ventas, kardex y turnos debe poder resolverse siempre.
Las facturas se **anulan** (`anulada=True`); no se borran.

### 4.2 Transacciones atómicas en el cobro

`POST /api/pos/ventas/procesar/` corre bajo `@transaction.atomic`. En un solo
movimiento debe:

1. Validar turno abierto y stock (bloqueo pesimista).
2. Descontar inventario, lotes y kardex.
3. Persistir cabecera `Venta`, `VentaDetalle` y `PagoVenta`.
4. Calcular y guardar IVA, total, `monto_recibido` y `cambio`.

Cualquier `ValidationError` (stock insuficiente, efectivo de menos) **revierte
todo**. No existe “venta a medias”.

### 4.3 Anulación / devolución (gerente)

`POST /api/pos/ventas/<id>/anular/` es atómico y multi-tenant:

1. Verifica `venta.turno.terminal.sucursal_id == request.user.sucursal_id`.
2. Rechaza si ya está `anulada`.
3. Devuelve stock a **esa** sucursal y registra kardex `DEVOLUCION_POS`.
4. Marca `venta.anulada = True`.

### 4.4 Facturación Ecuador

El sistema calcula en vivo, por línea de producto:

| Concepto | Regla |
|----------|--------|
| `aplica_iva = true` | Entra a **subtotal IVA 15%**. IVA = subtotal × 0.15 |
| `aplica_iva = false` | Entra a **subtotal IVA 0%** (canasta / tarifa 0) |
| `total_factura` | subtotal 15% + subtotal 0% + monto IVA |

El flag vive en `Producto`. Pan y leche de demostración van a 0%; cloro y el
resto, a 15%. Frontend (`useCart`) y backend (`procesar_venta`) deben coincidir
al céntimo (`ROUND_HALF_UP`).

Identificación de cliente: cédula **10** o RUC **13** con dígito verificador
ecuatoriano. Consumidor final: RUC `9999999999999` si no hay afiliado.

### 4.5 Imágenes de producto

Uso **estricto de `ImageField`**. Las fotos se guardan en `media/productos/`
(disco local), no como URL suelta ni como blob en texto. El POS y el catálogo
leen `imagen.url`. Pillow es dependencia de runtime.

### 4.6 Arqueo y auditoría de caja

Al cerrar turno: `descuadre = monto_cierre_real − monto_esperado`
(`monto_esperado` = apertura + ventas en efectivo). El gerente audita turnos
de su sucursal (`auditado=True`) ordenados por mayor descuadre absoluto.

`GET /api/pos/gerente/auditoria-cajas/?fecha_inicio=&fecha_fin=` lista turnos
cerrados del rango (default: últimos 7 días).  
`GET /api/pos/gerente/auditoria-cajas/<id>/desglose/` entrega el desglose
(apertura, efectivo, tarjeta/transferencia, esperado, real, descuadre y
últimos tickets) solo si el turno pertenece a la sucursal del gerente.

### 4.7 Seguridad y validaciones (obligatorio — 3 capas)

**Validación estricta:** todo campo de entrada debe estar tipado, limitado y
validado en **tres capas**:

1. **Base de datos / ORM** — `max_length`, `validators` (`MinValueValidator`,
   `RegexValidator`) y restricciones coherentes con el esquema legacy.
2. **API (serializers)** — rechazan payload inválido con **HTTP 400** y
   mensajes claros por campo.
3. **Frontend** — `maxLength` / `min` / `pattern`, filtros `onChange` y botón
   de guardar deshabilitado o error `text-danger` visible.

**Reglas específicas de Ecuador**

| Campo | Regla |
|-------|--------|
| Cédula | Exactamente **10** dígitos numéricos (+ dígito verificador). |
| RUC | Exactamente **13** dígitos numéricos (+ reglas SRI). |
| Teléfono móvil | Exactamente **10** dígitos numéricos. |

**Montos y cantidades**

- Precios, costos, stock, efectivo recibido, montos de apertura/cierre y
  cantidades de venta/lote/merma: **estrictamente ≥ 0**.
- No se permiten valores negativos en esos campos de entrada.
- El `descuadre` calculado (real − esperado) **sí puede ser negativo**
  (faltante); no se captura como monto manual negativo.

**Textos**

- Nombres y apellidos: sin caracteres de código (`<>{}[];\` etc.); preferir
  letras, espacios y guiones. `max_length` alineado al ORM (nombres ≤ 100).

---

## 5. Hoja de ruta (módulos en `specs/`)

| Código | Módulo | Enfoque |
|--------|--------|---------|
| `001-pos-ventas-caja` | POS / caja | Venta rápida, IVA, vuelto, turnos, descuadre |
| `002-inventario-almacen` | Inventario | Maestro, stock, lotes, kardex, reportes |
| `003-clientes-fidelizacion` | CRM | Cédula en POS, registro exprés, puntos |
| `004-multisucursal-geografia` | Sucursales | Mapa / asignación territorial |
| `005-gerente-sucursal` | Gerente | Dashboard, auditoría, devoluciones, multi-tenant |
| `006-mermas-auditoria` | Mermas | Bajas y auditoría de almacén |
| `007-seguridad-usuarios` | Seguridad | Roles, sesiones, permisos |

El detalle de hecho / pendiente vive en cada `specs/*/tasks.md`. Esta
constitución no se relaja por “atajos de demo”.
