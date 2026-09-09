from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pos", "0004_turno_descuadre"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="turnocaja",
                    name="auditado",
                    field=models.BooleanField(default=False),
                ),
                migrations.AddField(
                    model_name="venta",
                    name="anulada",
                    field=models.BooleanField(default=False),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE turno_caja
                            ADD COLUMN IF NOT EXISTS auditado boolean NOT NULL DEFAULT false;
                        ALTER TABLE venta
                            ADD COLUMN IF NOT EXISTS anulada boolean NOT NULL DEFAULT false;
                    """,
                    reverse_sql="""
                        ALTER TABLE turno_caja DROP COLUMN IF EXISTS auditado;
                        ALTER TABLE venta DROP COLUMN IF EXISTS anulada;
                    """,
                ),
            ],
        ),
    ]
