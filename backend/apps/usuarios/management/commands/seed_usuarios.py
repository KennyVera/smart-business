from django.core.management.base import BaseCommand
from django.db import connection

from apps.usuarios.models import Rol, Usuario
from apps.usuarios.services.sync_sucursales import sincronizar_todas

ADMIN_USUARIO = "admin"
ADMIN_CLAVE = "Admin123"

ROLES = [
    (1, "Administrador", "Acceso completo al módulo de administración."),
    (2, "Cajero", "Operación de caja y ventas en sucursal."),
    (3, "Bodeguero", "Inventario, ingresos y mermas de sucursal."),
    (4, "Gerente", "Supervisión operativa de una sucursal."),
]


class Command(BaseCommand):
    help = "Inserta roles, el admin central y sincroniza sucursales para asignar empleados."

    def handle(self, *args, **options):
        for id_rol, nombre, descripcion in ROLES:
            Rol.objects.update_or_create(
                id_rol=id_rol,
                defaults={"nombre": nombre, "descripcion": descripcion},
            )
        rol_admin = Rol.objects.get(id_rol=1)
        Usuario.objects.update_or_create(
            id_usuario=1,
            defaults={
                "username": ADMIN_USUARIO,
                "password_hash": ADMIN_CLAVE,
                "nombre": "Ana",
                "apellido": "Torres",
                "rol": rol_admin,
                "sucursal": None,
                "estado_activo": True,
            },
        )
        sincronizar_todas()
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval('rol_id_rol_seq', (SELECT MAX(id_rol) FROM rol))"
            )
            cursor.execute(
                "SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario))"
            )
        self.stdout.write(
            self.style.SUCCESS(f"Roles y admin listos. Usuario: {ADMIN_USUARIO}")
        )
