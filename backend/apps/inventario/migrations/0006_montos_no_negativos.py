from django.db import migrations, models


class Migration(migrations.Migration):
    """Estado ORM: montos/stock no negativos (tablas legacy managed=False)."""

    dependencies = [
        ("inventario", "0005_producto_aplica_iva"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name="producto",
                    name="precio_venta",
                    field=models.DecimalField(
                        decimal_places=2,
                        max_digits=10,
                    ),
                ),
                migrations.AlterField(
                    model_name="producto",
                    name="costo_actual",
                    field=models.DecimalField(
                        decimal_places=2,
                        max_digits=10,
                    ),
                ),
                migrations.AlterField(
                    model_name="inventariostock",
                    name="cantidad_actual",
                    field=models.IntegerField(default=0),
                ),
                migrations.AlterField(
                    model_name="inventariostock",
                    name="stock_minimo",
                    field=models.IntegerField(default=5),
                ),
                migrations.AlterField(
                    model_name="lotecaducidad",
                    name="cantidad",
                    field=models.IntegerField(),
                ),
                migrations.AlterField(
                    model_name="registromerma",
                    name="cantidad",
                    field=models.IntegerField(),
                ),
            ],
            database_operations=[],
        ),
    ]
