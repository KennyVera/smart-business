from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pos", "0002_venta_impuestos"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="venta",
                    name="monto_recibido",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AddField(
                    model_name="venta",
                    name="cambio",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE venta
                            ADD COLUMN IF NOT EXISTS monto_recibido numeric(10,2) NOT NULL DEFAULT 0,
                            ADD COLUMN IF NOT EXISTS cambio numeric(10,2) NOT NULL DEFAULT 0;
                    """,
                    reverse_sql="""
                        ALTER TABLE venta
                            DROP COLUMN IF EXISTS monto_recibido,
                            DROP COLUMN IF EXISTS cambio;
                    """,
                ),
            ],
        ),
    ]
