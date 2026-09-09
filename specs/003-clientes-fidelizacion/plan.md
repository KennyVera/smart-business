# 003 — Plan técnico: clientes y fidelización

## Objetivo de implementación

Reconocer cédula/RUC en el ticket POS, alta exprés sin salir de la venta y
dejar listo el modelo de puntos. Backend `backend/apps/crm`; UI de mostrador
en `frontend/src/modules/pos` (no hay backoffice CRM aún).

## Stack

| Capa | Tecnología |
|------|------------|
| API | Django + DRF (`/api/crm/`) |
| UI | React + Vite + Bootstrap (modal monocromático POS) |
| Validación | Dígito verificador cédula/RUC Ecuador |
| Entorno | Docker `:8000` / `:5173` |

## Apps / módulos

- `backend/apps/crm` — `Cliente`, serializers, validadores
- `frontend/src/modules/pos` — `ClienteBuscador`, `ModalNuevoCliente`
- `backend/apps/pos` — asocia `id_cliente` en `procesar_venta`

## Decisiones clave

1. **Consumidor final** = venta con `id_cliente = null` (RUC simbólico en UI).
2. Lookup por cédula con debounce; 404 dispara registro exprés.
3. Permiso de CRM de mostrador = mismo que venta (`PuedeVender`).
4. `puntos_acumulados` en modelo pero **sin** acumulación en cobro (fase futura).
5. Sin DELETE físico de clientes con historial.

## Fases de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| A | GET/POST clientes + validación EC | Hecho |
| B | Auto-reconocimiento + modal exprés en POS | Hecho |
| C | Asociación a venta | Hecho |
| D | Panel marketing + puntos/redención | Pendiente |

## Referencias

- `spec.md`, `data-model.md`, `tasks.md`
- Constitución §4.4 (identificación Ecuador)
