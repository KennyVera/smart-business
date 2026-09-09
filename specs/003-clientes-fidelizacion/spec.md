# 003 — Clientes y fidelización (CRM)

**Estado:** reconocimiento y alta exprés desde el POS.  
**Apps:** `backend/apps/crm`; UI de mostrador en `frontend/src/modules/pos`.  
**Roles de uso actual:** cajero / admin / gerente en el POS.

---

## 1. Objetivo

Identificar al comprador sin frenar la fila. El cajero escribe la cédula o el
RUC; si el afiliado existe se selecciona solo; si no, registra lo mínimo y
sigue cobrando. El consumidor final es el default.

## 2. Auto-reconocimiento desde el POS

Campo **ID Cliente (CRM)** en el ticket:

1. Solo dígitos, máximo 13. Debounce ~400 ms y `onBlur` / Enter.
2. Con 10 (cédula) o 13 (RUC) dígitos: `GET /api/crm/clientes/<cedula>/`.
3. **200:** etiqueta `👤 Cliente: [Nombres Apellidos] - Afiliado`.
   El `id_cliente` viaja en el POST de la venta.
4. **404:** texto gris `Cliente no encontrado.` y botón outline
   **+ Registrar Cliente**.
5. Input vacío o identificación incompleta:
   `👤 Cliente: Consumidor Final (9999999999999)`. La venta queda con
   `id_cliente = null`.

La cédula/RUC de **alta** se valida con dígito verificador ecuatoriano.
Nombres y apellidos: letras, espacios, guiones; tope ~25 caracteres.
Correo: opcional, formato email, tope 25 caracteres.

## 3. Registro exprés (modal)

Componente `ModalNuevoCliente`:

- Título: **Registro Rápido de Cliente**. Fondo blanco, texto negro.
- Cédula/RUC precargada (read-only).
- Nombres y apellidos obligatorios.
- Correo opcional (factura electrónica).
- Cancelar (texto gris) y **Guardar Cliente** (botón negro a ancho completo).

`POST /api/crm/clientes/` → **201**: el modal se cierra, aviso breve
“Cliente registrado y seleccionado” y el nuevo afiliado queda en el ticket.

No se navega a otro módulo. El registro exprés **no** sustituye un backoffice
de marketing.

## 4. Endpoints

| Método | Ruta | Resultado |
|--------|------|-----------|
| GET | `/api/crm/clientes/<cedula>/` | 200 ficha o **404** |
| POST | `/api/crm/clientes/` | 201 alta exprés |

Permiso: el mismo de venta POS (`PuedeVender`).

## 5. Fuera de alcance (ver `tasks.md`)

- Panel administrativo de CRM para el especialista de marketing.
- Acumulación y redención de `puntos_acumulados` en la venta.
