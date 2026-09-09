# 003 — Tareas: CRM y fidelización

Leyenda: `[x]` COMPLETADO · `[ ]` PENDIENTE

---

## Completado

- [x] Creación exprés de cliente en el POS (`ModalNuevoCliente` +
      `POST /api/crm/clientes/`).
- [x] Auto-reconocimiento por cédula/RUC (`GET /api/crm/clientes/<cedula>/`,
      200 o 404) y estados Consumidor final / Afiliado / No encontrado.
- [x] Validación de identificación ecuatoriana, nombres/apellidos y correo
      en alta de mostrador.
- [x] Asociación del `id_cliente` a la venta procesada.

## Pendiente

- [ ] Módulo administrativo de CRM (panel para el **Especialista de
      Marketing**: listado, edición, segmentos, historial de compras).
- [ ] Sistema de **acumulación de puntos** (`puntos_acumulados` en cobro,
      consulta de saldo en ticket, reglas de redención).
