from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pos", "0003_venta_recibido_cambio"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="turnocaja",
                    name="monto_esperado",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AddField(
                    model_name="turnocaja",
                    name="monto_cierre_real",
                    field=models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                migrations.AddField(
                    model_name="turnocaja",
                    name="descuadre",
                    field=models.DecimalField(
                        decimal_places=2, default=0, max_digits=10
                    ),
                ),
                migrations.AddField(
                    model_name="turnocaja",
                    name="estado",
                    field=models.CharField(default="Abierto", max_length=20),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE turno_caja
                            ADD COLUMN IF NOT EXISTS monto_esperado numeric(10,2) NOT NULL DEFAULT 0,
                            ADD COLUMN IF NOT EXISTS monto_cierre_real numeric(10,2) NULL,
                            ADD COLUMN IF NOT EXISTS descuadre numeric(10,2) NOT NULL DEFAULT 0,
                            ADD COLUMN IF NOT EXISTS estado varchar(20) NOT NULL DEFAULT 'Abierto';
                        UPDATE turno_caja
                           SET estado = 'Cerrado'
                         WHERE fecha_cierre IS NOT NULL;
                        UPDATE turno_caja
                           SET monto_cierre_real = monto_cierre_declarado
                         WHERE monto_cierre_real IS NULL
                           AND monto_cierre_declarado IS NOT NULL;
                    """,
                    reverse_sql="""
                        ALTER TABLE turno_caja
                            DROP COLUMN IF EXISTS monto_esperado,
                            DROP COLUMN IF EXISTS monto_cierre_real,
                            DROP COLUMN IF EXISTS descuadre,
                            DROP COLUMN IF EXISTS estado;
                    """,
                ),
            ],
        ),
    ]
