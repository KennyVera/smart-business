import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0003_usar_tablas_existentes"),
    ]

    operations = [
        migrations.CreateModel(
            name="SesionUsuario",
            fields=[
                ("id_sesion", models.AutoField(primary_key=True, serialize=False)),
                ("token_sesion", models.CharField(max_length=64, unique=True)),
                ("fecha_inicio", models.DateTimeField(auto_now_add=True)),
                ("fecha_fin", models.DateTimeField(blank=True, null=True)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="sesiones",
                        to="usuarios.usuario",
                    ),
                ),
            ],
            options={
                "verbose_name": "Sesión de usuario",
                "verbose_name_plural": "Sesiones de usuario",
                "db_table": "sesion_usuario",
                "ordering": ["-fecha_inicio"],
            },
        ),
    ]
