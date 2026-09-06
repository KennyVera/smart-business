from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0002_usuario_clave"),
    ]

    operations = [
        migrations.DeleteModel(name="Usuario"),
        migrations.DeleteModel(name="Rol"),
        migrations.CreateModel(
            name="Rol",
            fields=[
                ("id_rol", models.AutoField(primary_key=True, serialize=False)),
                ("nombre", models.CharField(max_length=50)),
                ("descripcion", models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                "verbose_name": "Rol",
                "verbose_name_plural": "Roles",
                "db_table": "rol",
                "ordering": ["id_rol"],
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="SucursalExistente",
            fields=[
                ("id_sucursal", models.AutoField(primary_key=True, serialize=False)),
                ("nombre", models.CharField(max_length=150)),
            ],
            options={
                "db_table": "sucursal",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Usuario",
            fields=[
                ("id_usuario", models.AutoField(primary_key=True, serialize=False)),
                ("username", models.CharField(max_length=50)),
                ("password_hash", models.CharField(max_length=255)),
                ("nombre", models.CharField(max_length=100)),
                ("apellido", models.CharField(max_length=100)),
                ("estado_activo", models.BooleanField(default=True)),
                (
                    "rol",
                    models.ForeignKey(
                        db_column="id_rol",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="usuarios",
                        to="usuarios.rol",
                    ),
                ),
                (
                    "sucursal",
                    models.ForeignKey(
                        blank=True,
                        db_column="id_sucursal",
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="usuarios",
                        to="usuarios.sucursalexistente",
                    ),
                ),
            ],
            options={
                "verbose_name": "Usuario",
                "verbose_name_plural": "Usuarios",
                "db_table": "usuario",
                "ordering": ["id_usuario"],
                "managed": False,
            },
        ),
    ]
