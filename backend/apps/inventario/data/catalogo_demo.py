CATEGORIAS = [
    "Lácteos",
    "Panadería",
    "Bebidas",
    "Abarrotes",
    "Limpieza",
]

# (sku, nombre, categoria, costo_actual, precio_venta)
PRODUCTOS = [
    ("LAC-0001", "Requesón artesanal 500 g", "Lácteos", "1.60", "2.75"),
    ("LAC-0002", "Leche entera 1 L", "Lácteos", "0.85", "1.05"),
    ("LAC-0003", "Yogur natural 1 L", "Lácteos", "1.40", "2.30"),
    ("LAC-0004", "Queso fresco 700 g", "Lácteos", "3.10", "4.90"),
    ("PAN-0001", "Pan de yema 6 u", "Panadería", "0.90", "1.50"),
    ("PAN-0002", "Integral molde 500 g", "Panadería", "1.30", "1.55"),
    ("BEB-0001", "Agua sin gas 1 L", "Bebidas", "0.35", "0.70"),
    ("BEB-0002", "Cola 3 L", "Bebidas", "1.75", "2.05"),
    ("ABA-0001", "Arroz 2 kg", "Abarrotes", "2.20", "2.60"),
    ("ABA-0002", "Aceite girasol 1 L", "Abarrotes", "2.05", "2.95"),
    ("LIM-0001", "Detergente 1 kg", "Limpieza", "2.40", "3.95"),
    ("LIM-0002", "Cloro 1 L", "Limpieza", "0.95", "1.60"),
]

# Canasta básica: pan y leche tarifa 0. El resto (cloro, snacks, etc.) IVA 15%.
SKUS_IVA_0 = {"LAC-0002", "PAN-0001", "PAN-0002"}

# (sku, cantidad_actual, stock_minimo)
STOCK = [
    ("LAC-0001", 4, 12),
    ("LAC-0002", 48, 20),
    ("LAC-0003", 9, 10),
    ("LAC-0004", 15, 8),
    ("PAN-0001", 2, 10),
    ("PAN-0002", 22, 6),
    ("BEB-0001", 60, 24),
    ("BEB-0002", 18, 12),
    ("ABA-0001", 30, 10),
    ("ABA-0002", 7, 15),
    ("LIM-0001", 25, 6),
    ("LIM-0002", 5, 5),
]

# (sku, codigo_lote, dias_para_vencer, cantidad)
LOTES = [
    ("LAC-0001", "L-REQ-2201", 3, 4),
    ("LAC-0002", "L-LEC-3310", 12, 24),
    ("LAC-0002", "L-LEC-3311", 40, 24),
    ("LAC-0003", "L-YOG-1180", -2, 3),
    ("LAC-0003", "L-YOG-1181", 21, 6),
    ("LAC-0004", "L-QUE-7702", 8, 15),
    ("PAN-0001", "L-PAN-0450", 1, 2),
    ("BEB-0002", "L-COL-9001", 180, 18),
]
