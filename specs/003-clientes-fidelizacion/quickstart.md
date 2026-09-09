# 003 — Quickstart: CRM en POS

## Arranque local

```bash
docker compose up
```

Abrir http://localhost:5173/pos con un usuario de venta.

## Usuarios demo

| Usuario | Clave |
|---------|-------|
| `admin` | `Admin123` |
| `gerente_cuenca` | `Admin123!` |
| Cajero (rol cajero) | según seed / Usuarios |

## Rutas UI

| Ruta | Uso |
|------|-----|
| `/pos` | Campo **ID Cliente (CRM)** en el ticket + modal registro |

## Endpoints clave

| Método | Ruta |
|--------|------|
| GET | `/api/crm/clientes/<cedula>/` → 200 o 404 |
| POST | `/api/crm/clientes/` → 201 alta exprés |
| POST | `/api/pos/ventas/procesar/` (incluye `id_cliente` opcional) |

## Smoke test

- [ ] Input vacío → etiqueta Consumidor Final.
- [ ] Cédula afiliada (seed) → muestra nombre Afiliado.
- [ ] Cédula inexistente válida → “No encontrado” + Registrar.
- [ ] Modal: nombres/apellidos OK, cédula inválida rechazada.
- [ ] Tras 201, cliente queda seleccionado en el ticket.
- [ ] Venta con afiliado persiste `id_cliente`.
- [ ] Venta sin ID → `id_cliente` null.
- [ ] Debounce: no dispara request a mitad de tipeo (< 10/13 dígitos).
