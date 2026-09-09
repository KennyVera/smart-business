from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0005_cantonexistente_subzonaexistente_zonaexistente"),
    ]

    operations = [
        migrations.CreateModel(
            name="Notificacion",
            fields=[
                ("id_notificacion", models.AutoField(primary_key=True, serialize=False)),
                ("titulo", models.CharField(max_length=100)),
                ("mensaje", models.TextField()),
                (
                    "tipo",
                    models.CharField(
                        choices=[
                            ("CAJA", "Caja"),
                            ("INVENTARIO", "Inventario"),
                            ("SISTEMA", "Sistema"),
                        ],
                        default="SISTEMA",
                        max_length=20,
                    ),
                ),
                ("leida", models.BooleanField(default=False)),
                ("fecha_creacion", models.DateTimeField(auto_now_add=True)),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notificaciones",
                        to="usuarios.usuario",
                    ),
                ),
            ],
            options={
                "verbose_name": "Notificación",
                "verbose_name_plural": "Notificaciones",
                "db_table": "notificacion",
                "ordering": ["-fecha_creacion", "-id_notificacion"],
            },
        ),
    ]
