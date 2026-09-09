from django.db import migrations, models
import django.db.models.deletion

import core.validators_negocio as validators_negocio


class Migration(migrations.Migration):

    dependencies = [
        ("inventario", "0006_montos_no_negativos"),
    ]

    operations = [
        migrations.CreateModel(
            name="Proveedor",
            fields=[
                ("id_proveedor", models.AutoField(primary_key=True, serialize=False)),
                (
                    "ruc",
                    models.CharField(
                        max_length=13,
                        unique=True,
                        validators=[validators_negocio.RUC_EMPRESA],
                    ),
                ),
                ("razon_social", models.CharField(max_length=150)),
                (
                    "nombre_contacto",
                    models.CharField(
                        max_length=100,
                        validators=[validators_negocio.NOMBRE_PERSONA],
                    ),
                ),
                (
                    "telefono",
                    models.CharField(
                        max_length=10,
                        validators=[validators_negocio.TELEFONO_MOVIL],
                    ),
                ),
                ("email", models.EmailField(max_length=100)),
                ("direccion", models.TextField()),
            ],
            options={
                "verbose_name": "Proveedor",
                "verbose_name_plural": "Proveedores",
                "db_table": "proveedor",
                "ordering": ["razon_social"],
            },
        ),
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="producto",
                    name="proveedor",
                    field=models.ForeignKey(
                        blank=True,
                        db_column="id_proveedor",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="productos",
                        to="inventario.proveedor",
                    ),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE producto "
                        "ADD COLUMN IF NOT EXISTS id_proveedor integer "
                        "NULL REFERENCES proveedor(id_proveedor) "
                        "ON DELETE SET NULL;"
                    ),
                    reverse_sql=(
                        "ALTER TABLE producto DROP COLUMN IF EXISTS id_proveedor;"
                    ),
                ),
            ],
        ),
    ]
