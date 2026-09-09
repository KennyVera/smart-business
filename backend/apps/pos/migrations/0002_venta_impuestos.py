import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("crm", "0001_cliente_puntos"),
        ("pos", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name="Cliente"),
                migrations.AddField(
                    model_name="venta",
                    name="subtotal_iva_0",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AddField(
                    model_name="venta",
                    name="subtotal_iva_15",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AddField(
                    model_name="venta",
                    name="monto_iva",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AddField(
                    model_name="venta",
                    name="total_factura",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AlterField(
                    model_name="venta",
                    name="cliente",
                    field=models.ForeignKey(
                        blank=True,
                        db_column="id_cliente",
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="ventas",
                        to="crm.cliente",
                    ),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE venta
                            ADD COLUMN IF NOT EXISTS subtotal_iva_0 numeric(10,2) NOT NULL DEFAULT 0,
                            ADD COLUMN IF NOT EXISTS subtotal_iva_15 numeric(10,2) NOT NULL DEFAULT 0,
                            ADD COLUMN IF NOT EXISTS monto_iva numeric(10,2) NOT NULL DEFAULT 0,
                            ADD COLUMN IF NOT EXISTS total_factura numeric(10,2) NOT NULL DEFAULT 0;
                    """,
                    reverse_sql="""
                        ALTER TABLE venta
                            DROP COLUMN IF EXISTS subtotal_iva_0,
                            DROP COLUMN IF EXISTS subtotal_iva_15,
                            DROP COLUMN IF EXISTS monto_iva,
                            DROP COLUMN IF EXISTS total_factura;
                    """,
                ),
            ],
        ),
    ]
