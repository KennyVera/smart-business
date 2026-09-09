# 002 — Inventario y almacén

**Estado:** operación diaria de bodega en demostración.  
**Apps:** `backend/apps/inventario`, `frontend/src/modules/inventario`.  
**Roles principales:** `bodeguero`, `administrador` (ops); `gerente` solo
**lectura** en Alertas/Reportes (sin Catálogo/Stock/Categorías).

---

## 1. Objetivo

Dar al almacén un maestro de productos por sucursal, visibilidad de stock,
control de caducidades, registro de mermas y un kardex auditable. La UI
prioriza tablas, filtros y paneles Offcanvas; los reportes salen a PDF/Excel.

**RBAC UI:** Catálogo, Categorías, Proveedores y Stock requieren rol bodeguero o admin.
Alertas y Reportes son compartidos; el gerente no ve botones de merma ni alta
de productos (guarda `RequireRol` + `puedeOperarInventario()`).

## 2. Maestro de productos

Cada `Producto` pertenece a una `Categoria` y tiene:

- `sku` único (código de barras / identificador de pistola).
- `nombre`, `costo_actual`, `precio_venta`.
- `proveedor` (FK opcional en BD / obligatorio en alta UI) → `Proveedor`.
- `aplica_iva` (true = gravado 15 %; false = tarifa 0).
- `imagen` (`ImageField`, `upload_to="productos/"`) — archivo real en `media/`.

### Proveedores

Tabla `proveedor` (`managed=True`): RUC 13 dígitos, razón social, contacto,
teléfono 10 dígitos, email, dirección. UI: `/inventario/proveedores`.
API: `/api/inventario/proveedores/`. En Kardex se muestra la razón social y un
enlace WhatsApp `https://wa.me/593` + teléfono sin el 0 inicial.

El formulario de alta/edición calcula un margen estimado en cliente (no se
persiste; 3FN). El POS consume el mismo maestro vía `/api/pos/catalogo/`.

**Baja lógica:** no se borra el producto; se mantiene el histórico de ventas y
kardex. Cualquier desactivación futura debe usar flag de activo, no `DELETE`.

## 3. Stock mínimo y alertas

`InventarioStock` es por **(sucursal, producto)**:

- `cantidad_actual`
- `stock_minimo` (umbral de alerta)

Las vistas de bodega resaltan filas bajo mínimo para reposición. El POS no
vende por encima del disponible: el cobro atómico bloquea y revierte.

## 4. Lotes y caducidades

`LoteCaducidad`: `codigo_lote`, `fecha_vencimiento`, `cantidad`, sucursal y
producto. Las entradas de lote incrementan stock y dejan movimiento de kardex
`ENTRADA_LOTE`. El descuento por venta consume lotes (FIFO operativo).

## 5. Mermas

`RegistroMerma`: cantidad, motivo, usuario, sucursal, producto, fecha.  
La merma descuenta stock y genera kardex `MERMA`. Sirve para merma operativa
(rotura, vencido, merma de proceso), no para anular una venta.

## 6. Kardex (`HistorialMovimiento`)

Historial append-only de entradas/salidas:

| Tipo | Origen típico |
|------|----------------|
| `ENTRADA_LOTE` | Ingreso de lote |
| `VENTA_POS` | Cobro en caja |
| `MERMA` | Baja por merma |
| `AJUSTE` | Ajuste manual |

Cada fila guarda `cantidad` (signo), `stock_resultante`, `usuario` y
`referencia`. En UI se abre como **Offcanvas** desde el producto, sin
abandonar la grilla.

## 7. Reportes operativos

El bodeguero exporta listados operativos a **PDF** (y Excel donde el módulo
ya lo expone). No sustituyen el kardex en pantalla; lo complementan.

## 8. Fuera de alcance (ver `tasks.md`)

Importación y exportación **masiva por CSV** del catálogo y del stock.
