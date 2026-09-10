"""Esquema resumido de tablas reales (PostgreSQL) para el prompt de Gemini."""

ESQUEMA_SQL = """
Tablas principales de Smart Business (PostgreSQL):

cliente(
  id_cliente PK, cedula, nombres, apellidos, email, telefono,
  fecha_nacimiento, fecha_registro, puntos_acumulados
)

producto(
  id_producto PK, id_categoria, id_proveedor, sku, nombre,
  precio_venta, costo_actual, imagen, aplica_iva
)

categoria(id_categoria PK, nombre)

inventario_stock(
  id_sucursal, id_producto, cantidad_actual, stock_minimo
)  -- PK compuesta (id_sucursal, id_producto)

sucursal(
  id_sucursal PK, id_canton, nombre, direccion,
  fecha_apertura, fecha_cierre, estado_activa
)

turno_caja(
  id_turno PK, id_usuario, id_terminal,
  fecha_apertura, fecha_cierre, monto_inicial, monto_cierre_real, auditado
)

terminal_pos(id_terminal PK, id_sucursal, numero_serie, activa)

venta(
  id_venta PK, id_turno, id_cliente, fecha_hora,
  subtotal_iva_0, subtotal_iva_15, monto_iva, total_factura,
  monto_recibido, cambio, anulada
)

venta_detalle(
  id_venta, id_producto, cantidad,
  precio_unitario_historico, costo_unitario_historico
)  -- PK compuesta (id_venta, id_producto)

pago_venta(id_pago PK, id_venta, id_metodo_pago, monto)
metodo_pago(id_metodo_pago PK, nombre)

Joins útiles:
- venta → turno_caja (id_turno) → terminal_pos (id_terminal) → sucursal (id_sucursal)
- venta_detalle → producto (id_producto)
- venta → cliente (id_cliente)
- inventario_stock → producto / sucursal

Reglas:
- Ignorar ventas con anulada = TRUE salvo que el usuario pida anuladas.
- Usar LIMIT razonable (máx. 100) si el usuario no especifica tope.
- Preferir alias claros en español para columnas del resultado.
""".strip()
