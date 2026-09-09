from django.db import migrations, models


class Migration(migrations.Migration):
    """Asegura telefono y fecha_nacimiento opcionales en cliente (tabla legacy)."""

    dependencies = [
        ("crm", "0001_cliente_puntos"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name="cliente",
                    name="telefono",
                    field=models.CharField(blank=True, max_length=15, null=True),
                ),
                migrations.AlterField(
                    model_name="cliente",
                    name="fecha_nacimiento",
                    field=models.DateField(blank=True, null=True),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE cliente "
                        "ADD COLUMN IF NOT EXISTS telefono varchar(15) NULL;"
                        "ALTER TABLE cliente "
                        "ADD COLUMN IF NOT EXISTS fecha_nacimiento date NULL;"
                    ),
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
        ),
    ]
