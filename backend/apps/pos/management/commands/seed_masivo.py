"""
Población masiva para demos BI / Reportes IA.
Usuarios por sucursal + clientes + stock alto + 300–500 ventas / sucursal (6 meses).
"""

from __future__ import annotations

import math
import random
import re
import unicodedata
from collections import defaultdict
from datetime import datetime, time, timedelta
from decimal import ROUND_HALF_UP, Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone

from apps.crm.models import Cliente
from apps.inventario.models import InventarioStock, Producto
from apps.pos.impuestos import TASA_IVA
from apps.pos.models import (
    MetodoPago,
    PagoVenta,
    TerminalPOS,
    TurnoCaja,
    Venta,
    VentaDetalle,
)
from apps.usuarios.models import Rol, SucursalExistente, Usuario

CENTAVO = Decimal("0.01")
CLAVE_ESTANDAR = "SmartBusiness2026!"
CLIENTES_MIN_POR_SUCURSAL = 20
VENTAS_MIN = 300
VENTAS_MAX = 500
STOCK_BASE = 2000
STOCK_MINIMO = 10
DIAS_HISTORIAL = 180
CHUNK = 400

NOMBRES = [
    "Carlos", "María", "Jorge", "Ana", "Luis", "Sofía", "Pedro", "Elena",
    "Diego", "Patricia", "Andrés", "Gabriela", "Ricardo", "Valeria", "Fernando",
    "Camila", "Miguel", "Daniela", "Héctor", "Paula", "Santiago", "Andrea",
    "Esteban", "Lucía", "Mauricio", "Carolina", "Iván", "Rosa", "Felipe",
    "Verónica", "Sebastián", "Diana", "Óscar", "Natalia", "Gustavo", "Adriana",
]
APELLIDOS = [
    "Zambrano", "Vera", "Macías", "Paredes", "Cabrera", "Andrade", "Mendoza",
    "Guaman", "Loja", "Espinoza", "Calle", "Torres", "Salinas", "Chávez",
    "Orellana", "Bustamante", "Álvarez", "Romero", "Vásquez", "Cevallos",
    "Idrovo", "Mora", "Pacheco", "Samaniego", "Cordero", "Aguilar", "Peralta",
    "Jaramillo", "Navarro", "Ullauri", "Reyes", "Quizhpe", "Benavides", "Crespo",
]

ROLES_SEED = (
    ("gerente", "Gerente de Sucursal", "Gerente"),
    ("cajero", "Cajero", "Cajero"),
    ("bodeguero", "Bodeguero", "Bodeguero"),
)


def plata(valor) -> Decimal:
    return Decimal(valor).quantize(CENTAVO, rounding=ROUND_HALF_UP)


def slug_sucursal(nombre: str) -> str:
    nfkd = unicodedata.normalize("NFKD", nombre or "")
    ascii_txt = "".join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "_", ascii_txt.lower()).strip("_") or "sucursal"


def set_password(usuario: Usuario, raw: str) -> None:
    """Compat ERP: la auth compara texto plano en password_hash (no Django auth)."""
    usuario.password_hash = raw


def cedula_valida(prefijo9: str) -> str:
    coeficientes = (2, 1, 2, 1, 2, 1, 2, 1, 2)
    total = 0
    for i, coeficiente in enumerate(coeficientes):
        valor = int(prefijo9[i]) * coeficiente
        if valor >= 10:
            valor -= 9
        total += valor
    verificador = (10 - (total % 10)) % 10
    return f"{prefijo9}{verificador}"


def billete_superior(total: Decimal) -> Decimal:
    total = plata(total)
    if total <= 0:
        return Decimal("0.00")
    techo = Decimal(str(math.ceil(float(total) / 10.0) * 10))
    if techo <= total:
        techo += Decimal("10.00")
    return plata(techo)


class Command(BaseCommand):
    help = (
        "Seed masivo: usuarios (gerente/cajero/bodeguero) por sucursal, "
        "clientes, stock alto y 300–500 ventas históricas por sucursal."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--ventas-min",
            type=int,
            default=VENTAS_MIN,
            help=f"Mínimo de ventas por sucursal (default {VENTAS_MIN}).",
        )
        parser.add_argument(
            "--ventas-max",
            type=int,
            default=VENTAS_MAX,
            help=f"Máximo de ventas por sucursal (default {VENTAS_MAX}).",
        )
        parser.add_argument(
            "--dias",
            type=int,
            default=DIAS_HISTORIAL,
            help=f"Días de historial hacia atrás (default {DIAS_HISTORIAL}).",
        )
        parser.add_argument(
            "--solo-usuarios",
            action="store_true",
            help="Solo crea/sincroniza usuarios por sucursal (sin ventas).",
        )

    def handle(self, *args, **options):
        random.seed()
        ventas_min = max(int(options["ventas_min"]), 1)
        ventas_max = max(int(options["ventas_max"]), ventas_min)
        dias = max(int(options["dias"]), 1)

        productos = list(Producto.objects.all())
        if not productos:
            raise CommandError("No hay productos en el catálogo. Ejecuta seed de inventario primero.")

        sucursales = list(
            SucursalExistente.objects.filter(estado_activa=True).order_by("nombre")
        )
        if not sucursales:
            raise CommandError("No hay sucursales activas en la base de datos.")

        roles = self._cargar_roles()
        metodos = self._cargar_metodos_pago()
        credenciales = []
        totales = {"clientes": 0, "ventas": 0, "detalles": 0}

        with transaction.atomic():
            for sucursal in sucursales:
                self.stdout.write(f"\n── Sucursal: {sucursal.nombre} ──")
                usuarios = self._aprovisionar_usuarios(sucursal, roles)
                for u in usuarios.values():
                    credenciales.append(
                        (u.username, CLAVE_ESTANDAR, u.rol.nombre, sucursal.nombre)
                    )

                if options["solo_usuarios"]:
                    continue

                cajero = usuarios["cajero"]
                terminal = self._obtener_terminal(sucursal)
                clientes = self._asegurar_clientes(sucursal)
                totales["clientes"] += len(clientes)

                stock_map = self._asegurar_stock(sucursal, productos)
                n_ventas = random.randint(ventas_min, ventas_max)
                creadas, n_det = self._generar_ventas_sucursal(
                    sucursal=sucursal,
                    cajero=cajero,
                    terminal=terminal,
                    metodos=metodos,
                    productos=productos,
                    clientes=clientes,
                    stock_map=stock_map,
                    n_ventas=n_ventas,
                    dias=dias,
                )
                totales["ventas"] += creadas
                totales["detalles"] += n_det
                self._persistir_stock(sucursal, stock_map)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  → {creadas} ventas / {n_det} líneas / "
                        f"{len(clientes)} clientes"
                    )
                )

            self._fixar_secuencias()

        self.stdout.write("")
        if options["solo_usuarios"]:
            self.stdout.write(self.style.SUCCESS("Usuarios sincronizados (sin ventas)."))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Seed masivo OK: {len(sucursales)} sucursales | "
                    f"{totales['clientes']} clientes tocados | "
                    f"{totales['ventas']} ventas | {totales['detalles']} detalles"
                )
            )
        self.stdout.write("")
        self.stdout.write(self.style.WARNING("Credenciales (password para todos):"))
        self.stdout.write(f"  {CLAVE_ESTANDAR}")
        self.stdout.write("")
        for username, _clave, rol, suc in credenciales:
            self.stdout.write(f"  {username:32}  [{rol}]  {suc}")

    def _cargar_roles(self) -> dict[str, Rol]:
        out = {}
        for clave, nombre_pref, nombre_alt in ROLES_SEED:
            rol = (
                Rol.objects.filter(nombre__iexact=nombre_pref).first()
                or Rol.objects.filter(nombre__icontains=nombre_alt).first()
            )
            if rol is None:
                raise CommandError(f'No existe el rol "{nombre_pref}". Ejecuta seed_usuarios.')
            out[clave] = rol
        return out

    def _cargar_metodos_pago(self) -> dict[str, MetodoPago]:
        nombres = ("Efectivo", "Tarjeta", "Transferencia")
        return {
            nombre: MetodoPago.objects.get_or_create(nombre=nombre)[0]
            for nombre in nombres
        }

    def _aprovisionar_usuarios(self, sucursal, roles) -> dict[str, Usuario]:
        slug = slug_sucursal(sucursal.nombre)
        creados = []
        sincronizados = []
        resultado = {}
        for clave, rol in roles.items():
            username = f"{clave}_{slug}"
            por_username = Usuario.objects.filter(username=username).first()
            if por_username:
                por_username.rol = rol
                por_username.sucursal = sucursal
                por_username.estado_activo = True
                set_password(por_username, CLAVE_ESTANDAR)
                por_username.save(
                    update_fields=[
                        "rol",
                        "sucursal",
                        "estado_activo",
                        "password_hash",
                    ]
                )
                resultado[clave] = por_username
                sincronizados.append(username)
                continue

            existente = (
                Usuario.objects.filter(sucursal=sucursal, rol=rol, estado_activo=True)
                .order_by("id_usuario")
                .first()
            )
            if existente:
                # Homologa username canónico si está libre; siempre aplica clave demo.
                libre = not Usuario.objects.filter(username=username).exclude(
                    pk=existente.pk
                ).exists()
                if libre and existente.username != username:
                    existente.username = username
                set_password(existente, CLAVE_ESTANDAR)
                existente.estado_activo = True
                existente.save(
                    update_fields=["username", "password_hash", "estado_activo"]
                )
                resultado[clave] = existente
                sincronizados.append(existente.username)
                continue

            nombre = random.choice(NOMBRES)
            apellido = random.choice(APELLIDOS)
            usuario = Usuario(
                username=username,
                nombre=nombre,
                apellido=apellido,
                email=f"{username}@smartbusiness.local",
                rol=rol,
                sucursal=sucursal,
                estado_activo=True,
            )
            set_password(usuario, CLAVE_ESTANDAR)
            usuario.save()
            resultado[clave] = usuario
            creados.append(username)

        if creados:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Usuarios creados para la sucursal {sucursal.nombre}: '
                    f'{", ".join(creados)}'
                )
            )
        elif sincronizados:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Usuarios sincronizados para la sucursal {sucursal.nombre}: "
                    f'{", ".join(sincronizados)}'
                )
            )
        return resultado

    def _obtener_terminal(self, sucursal) -> TerminalPOS:
        terminal = TerminalPOS.objects.filter(
            sucursal=sucursal, estado_activo=True
        ).first()
        if terminal:
            return terminal
        return TerminalPOS.objects.create(
            sucursal=sucursal,
            numero_serie=f"CAJA-{sucursal.pk:02d}-SEED",
            estado_activo=True,
        )

    def _asegurar_clientes(self, sucursal) -> list[Cliente]:
        """Clientes 'locales' = pool dedicado por sucursal (cedulas únicas)."""
        base = 100_000 + int(sucursal.pk) * 200
        clientes = []
        for i in range(CLIENTES_MIN_POR_SUCURSAL):
            idx = base + i
            cuerpo = f"09{idx:07d}"[:9]
            cedula = cedula_valida(cuerpo)
            nombres = random.choice(NOMBRES)
            apellidos = f"{random.choice(APELLIDOS)} {random.choice(APELLIDOS)}"
            cliente, _ = Cliente.objects.get_or_create(
                cedula_ruc=cedula,
                defaults={
                    "nombres": nombres,
                    "apellidos": apellidos,
                    "correo": f"cli_{sucursal.pk}_{i}@correo.com",
                    "telefono": f"09{random.randint(10000000, 99999999)}",
                    "puntos_acumulados": 0,
                },
            )
            clientes.append(cliente)
        return clientes

    def _asegurar_stock(self, sucursal, productos) -> dict[int, int]:
        """Garantiza stock alto; retorna mapa producto_id → cantidad en memoria."""
        existentes = {
            s.producto_id: s
            for s in InventarioStock.objects.filter(sucursal=sucursal)
        }
        crear = []
        stock_map = {}
        for producto in productos:
            fila = existentes.get(producto.pk)
            if fila is None:
                crear.append(
                    InventarioStock(
                        sucursal=sucursal,
                        producto=producto,
                        cantidad_actual=STOCK_BASE,
                        stock_minimo=STOCK_MINIMO,
                    )
                )
                stock_map[producto.pk] = STOCK_BASE
            else:
                qty = max(fila.cantidad_actual, STOCK_BASE)
                stock_map[producto.pk] = qty
                if fila.cantidad_actual < STOCK_BASE:
                    InventarioStock.objects.filter(
                        sucursal=sucursal, producto_id=producto.pk
                    ).update(cantidad_actual=STOCK_BASE, stock_minimo=STOCK_MINIMO)
        if crear:
            InventarioStock.objects.bulk_create(crear, batch_size=CHUNK)
        return stock_map

    def _persistir_stock(self, sucursal, stock_map: dict[int, int]) -> None:
        filas = list(InventarioStock.objects.filter(sucursal=sucursal))
        for fila in filas:
            if fila.producto_id in stock_map:
                fila.cantidad_actual = max(stock_map[fila.producto_id], 0)
        InventarioStock.objects.bulk_update(
            filas, ["cantidad_actual"], batch_size=CHUNK
        )

    def _generar_ventas_sucursal(
        self,
        *,
        sucursal,
        cajero,
        terminal,
        metodos,
        productos,
        clientes,
        stock_map,
        n_ventas,
        dias,
    ):
        ahora = timezone.localtime()
        # Pool vendible: ~85% productos (deja ~15% "stock muerto" para reportes).
        vendibles = productos[:]
        random.shuffle(vendibles)
        corte = max(int(len(vendibles) * 0.85), 1)
        pool_productos = vendibles[:corte]

        # ~25% clientes "perdidos": pocas compras y solo al inicio del rango.
        activos = clientes[: max(int(len(clientes) * 0.75), 1)]
        perdidos = clientes[len(activos) :]

        specs_por_dia: dict = defaultdict(list)
        for i in range(n_ventas):
            if perdidos and random.random() < 0.12:
                cliente = random.choice(perdidos)
                offset = random.randint(max(dias // 2, 1), dias)
            else:
                cliente = random.choice(activos) if random.random() < 0.85 else None
                # Más peso en semanas recientes (reportes vivos).
                if random.random() < 0.45:
                    offset = random.randint(0, min(30, dias))
                else:
                    offset = random.randint(0, dias)
            dia = (ahora - timedelta(days=offset)).date()
            specs_por_dia[dia].append(cliente)

        total_ventas = 0
        total_detalles = 0
        detalles_buffer: list[VentaDetalle] = []
        pagos_buffer: list[PagoVenta] = []

        for dia in sorted(specs_por_dia.keys()):
            clientes_dia = specs_por_dia[dia]
            apertura = timezone.make_aware(datetime.combine(dia, time(8, 0)))
            cierre = timezone.make_aware(datetime.combine(dia, time(20, 30)))
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

            ventas_objs = []
            meta_lineas = []  # paralelo a ventas_objs
            efectivo_dia = Decimal("0.00")

            for cliente in clientes_dia:
                minutos = random.randint(0, 11 * 60 + 50)
                fecha_emision = timezone.make_aware(
                    datetime.combine(dia, time(8, 0)) + timedelta(minutes=minutos)
                )
                n_lineas = min(len(pool_productos), random.randint(1, 5))
                elegidos = random.sample(pool_productos, n_lineas)
                lineas = []
                sub0 = Decimal("0.00")
                sub15 = Decimal("0.00")
                for producto in elegidos:
                    cantidad = random.randint(1, 4)
                    disponible = stock_map.get(producto.pk, 0)
                    if disponible < cantidad:
                        stock_map[producto.pk] = disponible + STOCK_BASE
                        disponible = stock_map[producto.pk]
                    stock_map[producto.pk] = disponible - cantidad
                    lineas.append((producto, cantidad))
                    bruto = producto.precio_venta * cantidad
                    if producto.aplica_iva:
                        sub15 += bruto
                    else:
                        sub0 += bruto

                sub0 = plata(sub0)
                sub15 = plata(sub15)
                iva = plata(sub15 * TASA_IVA)
                total = plata(sub0 + sub15 + iva)
                metodo = self._elegir_metodo(metodos)
                if metodo.nombre.lower() == "efectivo":
                    recibido = billete_superior(total)
                    cambio = plata(recibido - total)
                    efectivo_dia += total
                else:
                    recibido = total
                    cambio = Decimal("0.00")

                ventas_objs.append(
                    Venta(
                        turno=turno,
                        cliente=cliente,
                        fecha_hora=fecha_emision,
                        subtotal_iva_0=sub0,
                        subtotal_iva_15=sub15,
                        monto_iva=iva,
                        total_factura=total,
                        monto_recibido=recibido,
                        cambio=cambio,
                        anulada=False,
                    )
                )
                meta_lineas.append((lineas, metodo, total, fecha_emision))

            creadas = Venta.objects.bulk_create(ventas_objs, batch_size=CHUNK)
            # PostgreSQL: bulk_create rellena PK.
            for venta, (lineas, metodo, total, fecha_emision) in zip(
                creadas, meta_lineas
            ):
                if venta.fecha_hora != fecha_emision:
                    Venta.objects.filter(pk=venta.pk).update(fecha_hora=fecha_emision)
                for producto, cantidad in lineas:
                    detalles_buffer.append(
                        VentaDetalle(
                            venta=venta,
                            producto=producto,
                            cantidad=cantidad,
                            precio_unitario_historico=producto.precio_venta,
                            costo_unitario_historico=producto.costo_actual,
                        )
                    )
                pagos_buffer.append(
                    PagoVenta(venta=venta, metodo_pago=metodo, monto=total)
                )

            total_ventas += len(creadas)
            total_detalles += sum(len(m[0]) for m in meta_lineas)

            esperado = plata(Decimal("100.00") + efectivo_dia)
            TurnoCaja.objects.filter(pk=turno.pk).update(
                fecha_apertura=apertura,
                fecha_cierre=cierre,
                estado=TurnoCaja.CERRADO,
                monto_esperado=esperado,
                monto_cierre_real=esperado,
                monto_cierre_declarado=esperado,
                descuadre=Decimal("0.00"),
            )

            if len(detalles_buffer) >= CHUNK * 2:
                VentaDetalle.objects.bulk_create(detalles_buffer, batch_size=CHUNK)
                PagoVenta.objects.bulk_create(pagos_buffer, batch_size=CHUNK)
                detalles_buffer.clear()
                pagos_buffer.clear()

        if detalles_buffer:
            VentaDetalle.objects.bulk_create(detalles_buffer, batch_size=CHUNK)
        if pagos_buffer:
            PagoVenta.objects.bulk_create(pagos_buffer, batch_size=CHUNK)

        return total_ventas, total_detalles

    def _elegir_metodo(self, metodos):
        r = random.random()
        if r < 0.60:
            return metodos["Efectivo"]
        if r < 0.90:
            return metodos["Tarjeta"]
        return metodos["Transferencia"]

    def _fixar_secuencias(self):
        with connection.cursor() as cursor:
            for tabla, col in (
                ("usuario", "id_usuario"),
                ("cliente", "id_cliente"),
                ("venta", "id_venta"),
                ("turno_caja", "id_turno"),
                ("terminal_pos", "id_terminal"),
                ("metodo_pago", "id_metodo_pago"),
            ):
                cursor.execute(
                    f"SELECT setval(pg_get_serial_sequence(%s, %s), "
                    f"COALESCE((SELECT MAX({col}) FROM {tabla}), 1))",
                    [tabla, col],
                )
