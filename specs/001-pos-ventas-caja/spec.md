# 001 — POS: ventas y caja

**Estado:** flujo de cobro en producción de demostración.  
**Apps:** `backend/apps/pos`, `frontend/src/modules/pos`.  
**Roles:** `cajero`, `administrador`, `gerente`.

---

## 1. Objetivo

Permitir al cajero cobrar una venta en segundos: escanear o tocar productos,
reconocer cliente, elegir método de pago, calcular vuelto y dejar constancia
contable (IVA Ecuador) sin salir de una sola pantalla monocromática.

## 2. Superficie de UI

- Layout propio (`PosLayout`): **sin sidebar**.
- Columna izquierda (~8/12): buscador, pills de categoría, grilla de productos.
- Columna derecha (~4/12): **Resumen de venta** (ticket).
- Topbar: marca POS, reloj, cajero/caja, cerrar turno, logout.
  El cajero solo ve **Ventas**.

## 3. Flujo de venta rápida

1. Debe existir un **turno de caja abierto** en una terminal de la sucursal.
2. El cajero agrega líneas (clic, `+`, o pistola de códigos → Enter).
3. El carrito (`useCart`) acumula cantidad, respeta stock y recalcula:
   - `subtotalIva15`, `subtotalIva0`, `montoIva` (15 %), `total`.
4. ID Cliente (CRM): cédula/RUC con debounce. Si existe → afiliado. Si 404 →
   “Cliente no encontrado” + registro exprés. Vacío → Consumidor final.
5. Método de pago: Efectivo, Tarjeta, Transferencia, Otros.
6. **Finalizar venta** llama `POST /api/pos/ventas/procesar/` (atómico).
7. Modal **Venta registrada** con ticket, cliente, recibido y cambio.
8. “Nueva venta” limpia carrito, CRM y recibido; mantiene el turno.

## 4. Cálculo de cambio (efectivo)

| Método | Input “Recibido” | Cambio |
|--------|------------------|--------|
| Efectivo | Editable. El cajero digita lo que entrega el cliente. | `montoRecibido − total` |
| Tarjeta / Transferencia / Otros | `disabled`, valor = total | `$ 0.00` |

Debajo del input, en negrita: **Cambio a entregar: $ X.XX**.  
Si el efectivo no cubre el total, el texto pasa a “Falta $ X.XX”.

## 5. Bloqueo de finalización

El botón gigante **Finalizar venta** se deshabilita cuando:

- no hay líneas, o no hay turno, o no hay método; **o**
- el método es **Efectivo** y `montoRecibido < total` (incluye vacío).

El backend replica la regla: efectivo sin monto o menor al total lanza
`ValidationError` y la transacción no confirma.

## 6. Modal de éxito

Tras HTTP 201 se muestra:

- Título “Venta registrada” y `Ticket #00000N`.
- Total cobrado.
- Filas: Método, Cliente, **Recibido**, **Cambio** (esta última resaltada).
- Cliente afiliado por nombre; si no hubo cédula: Consumidor Final.

## 7. Endpoints relevantes

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/pos/turnos/actual/` | Turno vivo del cajero |
| POST | `/api/pos/turnos/abrir/` | Apertura |
| POST | `/api/pos/turnos/cerrar/` | Cierre declarado |
| GET | `/api/pos/catalogo/` | Vitrina con stock e `aplica_iva` |
| POST | `/api/pos/ventas/procesar/` | Cobro atómico |

## 8. Fuera de alcance de esta spec (ver `tasks.md`)

Arqueo de caja completo (conteo físico, diferencias, reporte de cierre
formal). La apertura/cierre actual es el mínimo para vender.
