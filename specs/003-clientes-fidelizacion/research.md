# 003 — Research: clientes y fidelización

## Contexto de negocio

En Ecuador el identificador de comprador es cédula (10) o RUC (13) con dígito
verificador. En retail el cajero no puede abrir un CRM completo: o reconoce
al afiliado en segundos o registra lo mínimo y cobra. Los puntos de lealtad
son un diferenciador, pero no deben bloquear el ticket.

## Alternativas consideradas

| Opción | Decisión |
|--------|----------|
| Módulo CRM standalone en MVP | **Aplazado** — solo exprés en POS |
| Fila “Consumidor final” en BD | **Rechazado** — `id_cliente` null |
| Acumular puntos en el mismo cobro v1 | **Aplazado** — campo listo, regla no |
| Validar solo longitud | **Rechazado** — dígito verificador EC |

## Riesgos / deuda técnica

- Esquema legado (`cedula` / `email` en BD vs nombres Django).
- Sin panel admin, la edición de clientes es limitada.
- Reglas de puntos (por dólar, vencimiento, redención) sin definir.

## Dependencias con otros specs

| Spec | Relación |
|------|----------|
| `001-pos-ventas-caja` | Canal de uso principal |
| `005-gerente-sucursal` | Anulación no borra cliente |
| `007-seguridad-usuarios` | Permiso `PuedeVender` |
