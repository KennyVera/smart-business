# 004 — Modelo de datos: geografía

Modelos en `backend/apps/geografia/models.py`. Jerarquía de planificación
territorial. La tabla operativa `sucursal` también se expone como
`SucursalExistente` (`managed = False`) desde `apps.usuarios` para FKs de
inventario/POS/usuarios.

---

## Jerarquía

```
ZonaPlanificacion
  └── Subzona
        └── CantonDistrito
              └── Sucursal
```

## Entidades

| Modelo | PK | Campos clave |
|--------|-----|--------------|
| `ZonaPlanificacion` | `id_nombre` | `nombre`, `codigo` (unique), `descripcion` |
| `Subzona` | `id_nombre` | `nombre`, FK `zona` |
| `CantonDistrito` | `id_nombre` | `nombre`, FK `subzona` |
| `Sucursal` | `id_nombre` | `nombre`, FK `canton`, `direccion`, `telefono`, `activa`, fechas apertura/cierre |

### Baja lógica

`Sucursal.activa = False` (y/o `estado_activa` en tabla legada). No se elimina
el registro: ventas, stock y terminales deben resolver el nombre histórico.

### Detalle operativo

`services/detalle_sucursal.py` consulta `terminal_pos` asociadas por nombre de
sucursal para el Offcanvas de detalle en UI.
