import json
import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.test import Client

from apps.inventario.models import HistorialMovimiento, InventarioStock
from apps.pos.models import MetodoPago
from apps.usuarios.jwt_tokens import emitir_jwt
from apps.usuarios.models import SesionUsuario, Usuario

cajero = Usuario.objects.select_related("rol", "sucursal").get(username="Cajero_")
token, jti = emitir_jwt(cajero)
SesionUsuario.objects.create(usuario=cajero, token_sesion=jti, is_active=True)
cliente = Client(headers={"authorization": f"Bearer {token}"})


def mostrar(titulo, respuesta):
    print(f"\n== {titulo} -> {respuesta.status_code}")
    try:
        datos = respuesta.json()
    except ValueError:
        print(respuesta.content[:400])
        return None
    print(json.dumps(datos, indent=2, ensure_ascii=False)[:1200])
    return datos


print(f"Cajero: {cajero.nombre} {cajero.apellido} / sucursal {cajero.sucursal_id}")

turno = mostrar("turnos/actual", cliente.get("/api/pos/turnos/actual/"))
if turno and turno.get("turno") is None:
    turno = mostrar(
        "turnos/abrir",
        cliente.post(
            "/api/pos/turnos/abrir/",
            data={"monto_apertura": "50.00"},
            content_type="application/json",
        ),
    )

catalogo = mostrar(
    "catalogo",
    cliente.get("/api/pos/catalogo/", {"page_size": 3, "con_stock": "true"}),
)
mostrar("categorias", cliente.get("/api/pos/categorias/", {"page_size": 500}))
mostrar("clientes", cliente.get("/api/pos/clientes/", {"buscar": "0102"}))

fila = catalogo["results"][0]
producto_id = fila["id_producto"]
sucursal_id = cajero.sucursal_id
antes = InventarioStock.objects.get(sucursal_id=sucursal_id, producto_id=producto_id)
print(f"\nStock antes: {antes.cantidad_actual} de {fila['nombre']}")

efectivo = MetodoPago.objects.get(nombre="Efectivo")
venta = mostrar(
    "ventas/procesar (2 unidades + 1 repetida)",
    cliente.post(
        "/api/pos/ventas/procesar/",
        data={
            "items": [
                {"producto": producto_id, "cantidad": 2},
                {"producto": producto_id, "cantidad": 1},
            ],
            "metodo_pago": efectivo.pk,
            "monto_recibido": "100.00",
        },
        content_type="application/json",
    ),
)

despues = InventarioStock.objects.get(sucursal_id=sucursal_id, producto_id=producto_id)
print(f"Stock después: {despues.cantidad_actual} (esperado {antes.cantidad_actual - 3})")
movimiento = (
    HistorialMovimiento.objects.filter(
        producto_id=producto_id,
        tipo=HistorialMovimiento.VENTA_POS,
    )
    .order_by("-id_movimiento")
    .first()
)
print(f"Kardex: {movimiento.tipo} {movimiento.cantidad} -> {movimiento.stock_resultante} ({movimiento.referencia})")

sobrante = despues.cantidad_actual
mostrar(
    "ventas/procesar sin stock (debe hacer rollback)",
    cliente.post(
        "/api/pos/ventas/procesar/",
        data={
            "items": [{"producto": producto_id, "cantidad": sobrante + 500}],
            "metodo_pago": efectivo.pk,
        },
        content_type="application/json",
    ),
)
final = InventarioStock.objects.get(sucursal_id=sucursal_id, producto_id=producto_id)
print(f"Stock tras el rollback: {final.cantidad_actual} (debe seguir en {sobrante})")

mostrar("ventas (listado)", cliente.get("/api/pos/ventas/"))
mostrar("turnos/actual con resumen", cliente.get("/api/pos/turnos/actual/"))
