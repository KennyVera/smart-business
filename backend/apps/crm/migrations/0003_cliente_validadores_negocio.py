from django.db import migrations, models


class Migration(migrations.Migration):
    """Estado ORM: validadores de cédula/teléfono/nombres (tabla legacy)."""

    dependencies = [
        ("crm", "0002_cliente_contacto_opcional"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name="cliente",
                    name="cedula_ruc",
                    field=models.CharField(
                        blank=True,
                        db_column="cedula",
                        max_length=13,
                        null=True,
                        unique=True,
                    ),
                ),
                migrations.AlterField(
                    model_name="cliente",
                    name="nombres",
                    field=models.CharField(max_length=100),
                ),
                migrations.AlterField(
                    model_name="cliente",
                    name="apellidos",
                    field=models.CharField(blank=True, default="", max_length=100),
                ),
                migrations.AlterField(
                    model_name="cliente",
                    name="telefono",
                    field=models.CharField(blank=True, max_length=10, null=True),
                ),
                migrations.AlterField(
                    model_name="cliente",
                    name="puntos_acumulados",
                    field=models.IntegerField(default=0),
                ),
            ],
            database_operations=[],
        ),
    ]
