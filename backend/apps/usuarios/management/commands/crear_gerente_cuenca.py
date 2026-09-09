from datetime import date

from django.core.management.base import BaseCommand
from django.db import connection

from apps.usuarios.models import Rol, SucursalExistente, Usuario

ROL_NOMBRE = "Gerente de Sucursal"
SUCURSAL_NOMBRE = "Cuenca Centro"
USERNAME = "gerente_cuenca"
CLAVE = "Admin123!"


class Command(BaseCommand):
    help = "Crea el gerente de prueba de la sucursal Cuenca Centro."

    def handle(self, *args, **options):
        sucursal = self._sucursal()
        rol = self._rol()
        usuario, creado = Usuario.objects.update_or_create(
            username=USERNAME,
            defaults={
                "password_hash": CLAVE,
                "nombre": "María",
                "apellido": "Vega",
                "rol": rol,
                "sucursal": sucursal,
                "estado_activo": True,
            },
        )
        self._fixar_secuencias()
        verbo = "Creado" if creado else "Actualizado"
        self.stdout.write(
            self.style.SUCCESS(
                f"{verbo}: {usuario.username} → {rol.nombre} / {sucursal.nombre}"
            )
        )

    def _sucursal(self):
        hallada = SucursalExistente.objects.filter(nombre=SUCURSAL_NOMBRE).first()
        if hallada:
            return hallada
        ref = SucursalExistente.objects.order_by("id_sucursal").first()
        return SucursalExistente.objects.create(
            nombre=SUCURSAL_NOMBRE,
            id_canton=ref.id_canton if ref else 1,
            direccion="Calle Larga 8-54 y Benigno Malo",
            fecha_apertura=date(2020, 2, 10),
            estado_activa=True,
        )

    def _rol(self):
        rol = Rol.objects.filter(nombre__iexact=ROL_NOMBRE).first()
        if rol:
            return rol
        legado = Rol.objects.filter(nombre__iexact="Gerente").first()
        if legado:
            legado.nombre = ROL_NOMBRE
            legado.descripcion = "Supervisión operativa de una sucursal."
            legado.save(update_fields=["nombre", "descripcion"])
            return legado
        return Rol.objects.create(
            nombre=ROL_NOMBRE,
            descripcion="Supervisión operativa de una sucursal.",
        )

    def _fixar_secuencias(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval('rol_id_rol_seq', (SELECT MAX(id_rol) FROM rol))"
            )
            cursor.execute(
                "SELECT setval('usuario_id_usuario_seq', "
                "(SELECT MAX(id_usuario) FROM usuario))"
            )
