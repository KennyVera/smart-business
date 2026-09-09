import math
import random
from datetime import datetime, time, timedelta
from decimal import ROUND_HALF_UP, Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.crm.models import Cliente
from apps.inventario.models import HistorialMovimiento, InventarioStock, Producto
from apps.inventario.services.kardex import registrar_movimiento
from apps.inventario.services.stock import descontar_lotes
from apps.pos.impuestos import TASA_IVA
from apps.pos.models import (
    MetodoPago,
    PagoVenta,
    TerminalPOS,
    TurnoCaja,
    Venta,
    VentaDetalle,
)
from apps.usuarios.models import SucursalExistente, Usuario

CENTAVO = Decimal("0.01")
STOCK_MINIMO_SEED = 10
STOCK_BASE_SEED = 800

NOMBRES_CLIENTES = [
    ("Carlos", "Zambrano"),
    ("María", "Vera"),
    ("Jorge", "Macías"),
    ("Ana", "Paredes"),
    ("Luis", "Cabrera"),
    ("Sofía", "Andrade"),
    ("Pedro", "Mendoza"),
    ("Elena", "Guaman"),
    ("Diego", "Loja"),
    ("Patricia", "Espinoza"),
    ("Andrés", "Calle"),
    ("Gabriela", "Torres"),
    ("Ricardo", "Salinas"),
    ("Valeria", "Chávez"),
    ("Fernando", "Orellana"),
    ("Camila", "Bustamante"),
    ("Miguel", "Álvarez"),
    ("Daniela", "Romero"),
    ("Héctor", "Vásquez"),
    ("Paula", "Cevallos"),
    ("Santiago", "Idrovo"),
    ("Andrea", "Mora"),
    ("Esteban", "Pacheco"),
    ("Lucía", "Samaniego"),
    ("Mauricio", "Cordero"),
    ("Carolina", "Aguilar"),
    ("Iván", "Peralta"),
    ("Rosa", "Jaramillo"),
    ("Felipe", "Navarro"),
    ("Verónica", "Ullauri"),
    ("Sebastián", "Reyes"),
    ("Diana", "Quizhpe"),
    ("Óscar", "Benavides"),
    ("Natalia", "Crespo"),
    ("Gustavo", "Ambrosi"),
    ("Adriana", "Palacios"),
    ("Raúl", "Sarmiento"),
    ("Melissa", "Lazo"),
    ("Jonathan", "Pinos"),
    ("Katherine", "Malla"),
    ("Christian", "Aucay"),
    ("Nicole", "Farfán"),
    ("Kevin", "Zhagui"),
    ("Jennifer", "Llivisaca"),
    ("Bryan", "Pintado"),
    ("Stephanie", "Cabrera"),
    ("Alex", "Guerrero"),
    ("Michelle", "Ordoñez"),
    ("David", "Campoverde"),
    ("Alejandra", "Tenesaca"),
]


def plata(valor):
    return Decimal(valor).quantize(CENTAVO, rounding=ROUND_HALF_UP)


def cedula_ficticia(indice):
    """Cédula de 10 dígitos: 09 + 7 dígitos de secuencia + dígito verificador."""
    cuerpo = f"09{indice:07d}"
    coeficientes = (2, 1, 2, 1, 2, 1, 2, 1, 2)
    total = 0
    for i, coeficiente in enumerate(coeficientes):
        valor = int(cuerpo[i]) * coeficiente
        if valor >= 10:
            valor -= 9
        total += valor
    verificador = (10 - (total % 10)) % 10
    return f"{cuerpo}{verificador}"


def billete_superior(total):
    """Simula pago en efectivo con billete redondeado a la decena superior."""
    total = plata(total)
    if total <= 0:
        return Decimal("0.00")
    techo = Decimal(str(math.ceil(float(total) / 10.0) * 10))
    if techo < total:
        techo += Decimal("10.00")
    if techo == total:
        techo += Decimal("10.00")
    return plata(techo)


class Command(BaseCommand):
    help = (
        "Genera 50 clientes y un mes de ventas simuladas en Cuenca Centro "
        "para alimentar dashboards gerencial y global."
    )

    def handle(self, *args, **options):
        random.seed()
        with transaction.atomic():
            sucursal = self.obtener_sucursal()
            cajero = self.obtener_cajero(sucursal)
            terminal = self.obtener_terminal(sucursal)
            metodos = self.obtener_metodos_pago()
            productos = list(
                Producto.objects.filter(
                    stock__sucursal=sucursal,
                    stock__cantidad_actual__gt=0,
                ).distinct()
            )
            if not productos:
                productos = list(Producto.objects.all())
            if not productos:
                raise CommandError("No hay productos en el catálogo para vender.")

            self.asegurar_stock(sucursal, productos, cajero)
            clientes, cedulas = self.crear_clientes()
            total_ventas = self.generar_mes(
                sucursal=sucursal,
                cajero=cajero,
                terminal=terminal,
                metodos=metodos,
                productos=productos,
                clientes=clientes,
            )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"¡Éxito! {len(clientes)} clientes creados y "
                f"{total_ventas} ventas registradas en el último mes."
            )
        )
        self.stdout.write("")
        self.stdout.write(self.style.WARNING("Cédulas ficticias de los 50 clientes:"))
        for i, (cliente, cedula) in enumerate(zip(clientes, cedulas), start=1):
            self.stdout.write(
                f"  {i:02d}. {cedula} — {cliente.nombres} {cliente.apellidos}"
            )

    def obtener_sucursal(self):
        sucursal = SucursalExistente.objects.filter(
            nombre__iexact="Cuenca Centro"
        ).first()
        if not sucursal:
            raise CommandError('La sucursal "Cuenca Centro" no existe.')
        return sucursal

    def obtener_cajero(self, sucursal):
        cajero = (
            Usuario.objects.select_related("rol", "sucursal")
            .filter(
                rol__nombre__iexact="Cajero",
                sucursal=sucursal,
                estado_activo=True,
            )
            .order_by("id_usuario")
            .first()
        )
        if cajero is None:
            cajero = (
                Usuario.objects.select_related("rol", "sucursal")
                .filter(nombre__iexact="Kenny", apellido__icontains="Espa")
                .first()
            )
        if cajero is None:
            raise CommandError(
                "No encontré un cajero activo en Cuenca Centro "
                "(ni al usuario Kenny España)."
            )
        return cajero

    def obtener_terminal(self, sucursal):
        terminal = TerminalPOS.objects.filter(
            sucursal=sucursal,
            estado_activo=True,
        ).first()
        if terminal:
            return terminal
        return TerminalPOS.objects.create(
            sucursal=sucursal,
            numero_serie=f"CAJA-{sucursal.pk:02d}-01",
            estado_activo=True,
        )

    def obtener_metodos_pago(self):
        nombres = ("Efectivo", "Tarjeta", "Transferencia")
        metodos = {}
        for nombre in nombres:
            metodos[nombre], _ = MetodoPago.objects.get_or_create(nombre=nombre)
        return metodos

    def asegurar_stock(self, sucursal, productos, usuario):
        """Garantiza inventario suficiente para un mes de ventas simuladas."""
        for producto in productos:
            fila = InventarioStock.objects.filter(
                sucursal=sucursal,
                producto=producto,
            ).first()
            if fila is None:
                InventarioStock.objects.create(
                    sucursal=sucursal,
                    producto=producto,
                    cantidad_actual=STOCK_BASE_SEED,
                    stock_minimo=STOCK_MINIMO_SEED,
                )
                registrar_movimiento(
                    sucursal.pk,
                    producto.pk,
                    HistorialMovimiento.AJUSTE,
                    STOCK_BASE_SEED,
                    STOCK_BASE_SEED,
                    usuario=usuario,
                    referencia="Stock base seed ventas simuladas",
                )
            elif fila.cantidad_actual < STOCK_BASE_SEED:
                delta = STOCK_BASE_SEED - fila.cantidad_actual
                InventarioStock.objects.filter(
                    sucursal=sucursal,
                    producto=producto,
                ).update(cantidad_actual=STOCK_BASE_SEED, stock_minimo=STOCK_MINIMO_SEED)
                registrar_movimiento(
                    sucursal.pk,
                    producto.pk,
                    HistorialMovimiento.AJUSTE,
                    delta,
                    STOCK_BASE_SEED,
                    usuario=usuario,
                    referencia="Reposición seed ventas simuladas",
                )

    def crear_clientes(self):
        clientes = []
        cedulas = []
        for indice, (nombres, apellidos) in enumerate(NOMBRES_CLIENTES, start=1):
            cedula = cedula_ficticia(indice)
            correo = f"cliente{indice}@correo.com"
            cliente, _ = Cliente.objects.get_or_create(
                cedula_ruc=cedula,
                defaults={
                    "nombres": nombres,
                    "apellidos": apellidos,
                    "correo": correo,
                    "telefono": f"09{random.randint(10000000, 99999999)}",
                    "puntos_acumulados": 0,
                },
            )
            clientes.append(cliente)
            cedulas.append(cedula)
        return clientes, cedulas

    def generar_mes(self, *, sucursal, cajero, terminal, metodos, productos, clientes):
        total_ventas = 0
        ahora = timezone.localtime()

        for dias_atras in range(30, -1, -1):
            dia = (ahora - timedelta(days=dias_atras)).date()
            apertura = timezone.make_aware(datetime.combine(dia, time(8, 0)))
            cierre = timezone.make_aware(datetime.combine(dia, time(20, 0)))

            turno = TurnoCaja.objects.create(
                terminal=terminal,
                usuario=cajero,
                monto_apertura=Decimal("100.00"),
                monto_esperado=Decimal("100.00"),
                estado=TurnoCaja.ABIERTO,
            )
            TurnoCaja.objects.filter(pk=turno.pk).update(
                fecha_apertura=apertura,
                fecha_cierre=None,
            )

            num_ventas = random.randint(10, 30)
            efectivo_del_dia = Decimal("0.00")

            for _ in range(num_ventas):
                venta, metodo = self.crear_venta(
                    turno=turno,
                    sucursal=sucursal,
                    cajero=cajero,
                    productos=productos,
                    clientes=clientes,
                    metodos=metodos,
                    dia=dia,
                )
                total_ventas += 1
                if metodo.nombre.lower() == "efectivo":
                    efectivo_del_dia += venta.total_factura

            esperado = plata(Decimal("100.00") + efectivo_del_dia)
            TurnoCaja.objects.filter(pk=turno.pk).update(
                fecha_apertura=apertura,
                fecha_cierre=cierre,
                estado=TurnoCaja.CERRADO,
                monto_esperado=esperado,
                monto_cierre_real=esperado,
                monto_cierre_declarado=esperado,
                descuadre=Decimal("0.00"),
            )

            self.stdout.write(
                f"Día {dia.isoformat()} generado: {num_ventas} ventas..."
            )

        return total_ventas

    def crear_venta(self, *, turno, sucursal, cajero, productos, clientes, metodos, dia):
        minutos = random.randint(0, 11 * 60 + 59)
        fecha_emision = timezone.make_aware(
            datetime.combine(dia, time(8, 0)) + timedelta(minutes=minutos)
        )

        cliente = random.choice(clientes) if random.random() < 0.70 else None
        metodo = self.elegir_metodo(metodos)

        lineas = self.elegir_lineas(productos)
        subtotal_iva_0 = Decimal("0.00")
        subtotal_iva_15 = Decimal("0.00")

        venta = Venta.objects.create(turno=turno, cliente=cliente)

        for producto, cantidad in lineas:
            self.descontar_stock(
                sucursal_id=sucursal.pk,
                producto=producto,
                cantidad=cantidad,
                usuario=cajero,
                referencia=f"Venta simulada #{venta.pk}",
            )
            VentaDetalle.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario_historico=producto.precio_venta,
                costo_unitario_historico=producto.costo_actual,
            )
            linea = producto.precio_venta * cantidad
            if producto.aplica_iva:
                subtotal_iva_15 += linea
            else:
                subtotal_iva_0 += linea

        subtotal_iva_0 = plata(subtotal_iva_0)
        subtotal_iva_15 = plata(subtotal_iva_15)
        monto_iva = plata(subtotal_iva_15 * TASA_IVA)
        total = plata(subtotal_iva_0 + subtotal_iva_15 + monto_iva)

        if metodo.nombre.lower() == "efectivo":
            recibido = billete_superior(total)
            cambio = plata(recibido - total)
        else:
            recibido = total
            cambio = Decimal("0.00")

        venta.subtotal_iva_0 = subtotal_iva_0
        venta.subtotal_iva_15 = subtotal_iva_15
        venta.monto_iva = monto_iva
        venta.total_factura = total
        venta.monto_recibido = recibido
        venta.cambio = cambio
        venta.save(
            update_fields=[
                "subtotal_iva_0",
                "subtotal_iva_15",
                "monto_iva",
                "total_factura",
                "monto_recibido",
                "cambio",
            ]
        )
        Venta.objects.filter(pk=venta.pk).update(fecha_hora=fecha_emision)

        PagoVenta.objects.create(
            venta=venta,
            metodo_pago=metodo,
            monto=total,
        )
        return venta, metodo

    def elegir_metodo(self, metodos):
        r = random.random()
        if r < 0.60:
            return metodos["Efectivo"]
        if r < 0.90:
            return metodos["Tarjeta"]
        return metodos["Transferencia"]

    def elegir_lineas(self, productos):
        cantidad_productos = min(len(productos), random.randint(1, 5))
        elegidos = random.sample(productos, cantidad_productos)
        return [(producto, random.randint(1, 4)) for producto in elegidos]

    def descontar_stock(self, *, sucursal_id, producto, cantidad, usuario, referencia):
        fila = (
            InventarioStock.objects.select_for_update()
            .filter(sucursal_id=sucursal_id, producto_id=producto.pk)
            .first()
        )
        disponible = fila.cantidad_actual if fila else 0
        if disponible < cantidad:
            falta = cantidad - disponible + STOCK_BASE_SEED
            if fila is None:
                InventarioStock.objects.create(
                    sucursal_id=sucursal_id,
                    producto=producto,
                    cantidad_actual=falta,
                    stock_minimo=STOCK_MINIMO_SEED,
                )
            else:
                InventarioStock.objects.filter(
                    sucursal_id=sucursal_id,
                    producto_id=producto.pk,
                ).update(cantidad_actual=F("cantidad_actual") + falta)
            disponible = InventarioStock.objects.get(
                sucursal_id=sucursal_id,
                producto_id=producto.pk,
            ).cantidad_actual
            registrar_movimiento(
                sucursal_id,
                producto.pk,
                HistorialMovimiento.AJUSTE,
                falta,
                disponible,
                usuario=usuario,
                referencia="Auto-reposición seed ventas",
            )

        InventarioStock.objects.filter(
            sucursal_id=sucursal_id,
            producto_id=producto.pk,
        ).update(cantidad_actual=F("cantidad_actual") - cantidad)
        stock_resultante = InventarioStock.objects.get(
            sucursal_id=sucursal_id,
            producto_id=producto.pk,
        ).cantidad_actual
        descontar_lotes(sucursal_id, producto.pk, cantidad)
        registrar_movimiento(
            sucursal_id,
            producto.pk,
            HistorialMovimiento.VENTA_POS,
            -cantidad,
            stock_resultante,
            usuario=usuario,
            referencia=referencia,
        )
