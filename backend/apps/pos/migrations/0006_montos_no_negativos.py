from django.db import migrations, models


class Migration(migrations.Migration):
    """Estado ORM: montos de caja/venta >= 0 (tablas legacy managed=False)."""

    dependencies = [
        ("pos", "0005_gerente_auditoria_anulacion"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name="turnocaja",
                    name="monto_apertura",
                    field=models.DecimalField(decimal_places=2, max_digits=10),
                ),
                migrations.AlterField(
                    model_name="turnocaja",
                    name="monto_esperado",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AlterField(
                    model_name="turnocaja",
                    name="monto_cierre_real",
                    field=models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                migrations.AlterField(
                    model_name="turnocaja",
                    name="monto_cierre_declarado",
                    field=models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                migrations.AlterField(
                    model_name="venta",
                    name="monto_recibido",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AlterField(
                    model_name="venta",
                    name="cambio",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AlterField(
                    model_name="ventadetalle",
                    name="cantidad",
                    field=models.IntegerField(),
                ),
                migrations.AlterField(
                    model_name="pagoventa",
                    name="monto",
                    field=models.DecimalField(decimal_places=2, max_digits=10),
                ),
            ],
            database_operations=[],
        ),
    ]
