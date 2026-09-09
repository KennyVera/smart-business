from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventario", "0004_producto_imagen"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="producto",
                    name="aplica_iva",
                    field=models.BooleanField(default=True),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE producto "
                        "ADD COLUMN IF NOT EXISTS aplica_iva boolean "
                        "NOT NULL DEFAULT TRUE;"
                    ),
                    reverse_sql="ALTER TABLE producto DROP COLUMN IF EXISTS aplica_iva;",
                ),
            ],
        ),
    ]
