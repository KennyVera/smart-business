# 003 — Modelo de datos: cliente CRM

Tabla física `cliente`. Modelo Django `apps.crm.models.Cliente`,
`managed = False`. Columna de cédula en BD: `cedula`. Columna de correo: `email`.

---

## `cliente` → `Cliente`

| Campo (Django) | Columna BD | Tipo | Restricciones |
|----------------|------------|------|----------------|
| `id_cliente` | `id_cliente` | PK | Autoincremental |
| `cedula_ruc` | `cedula` | varchar(13) | **Unique**. 10 o 13 dígitos. Null/blank permitidos en esquema legado; el alta POS exige valor y dígito verificador. |
| `nombres` | `nombres` | varchar(100) | Obligatorio. En POS exprés: letras, máx. 25. |
| `apellidos` | `apellidos` | varchar(100) | En POS exprés: obligatorio, mismas reglas que nombres. |
| `correo` | `email` | varchar(100) | Opcional (`null`/`blank`). Si viene, email válido; POS recorta a 25. |
| `telefono` | `telefono` | varchar(15) | Opcional |
| `puntos_acumulados` | `puntos_acumulados` | int | Default 0. **Aún no** se incrementa al vender. |
| `fecha_nacimiento` | `fecha_nacimiento` | date | Opcional |
| `fecha_registro` | `fecha_registro` | timestamptz | Alta |

### Identidad

- Unique de negocio: `cedula_ruc`.
- `nombre_completo` es propiedad de solo lectura (`nombres + apellidos`).
- Consumidor final **no** es una fila: la venta queda con `id_cliente` nulo.

### Relación con ventas

`Venta.cliente` → `Cliente` (`on_delete=PROTECT`, null=True).  
No se borra un cliente con historial; aplica baja lógica si se desactiva en
el futuro módulo administrativo.

### Puntos

`puntos_acumulados` está en el modelo y en el serializer. La regla de
acumulación (por dólar, por SKU, vencimientos) es trabajo pendiente del
módulo de fidelización, no del registro exprés.
