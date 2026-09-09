from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventario", "0003_producto_imagen_url"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(
                    model_name="producto",
                    name="imagen_url",
                ),
                migrations.AddField(
                    model_name="producto",
                    name="imagen",
                    field=models.ImageField(
                        blank=True,
                        max_length=255,
                        null=True,
                        upload_to="productos/",
                    ),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE producto "
                        "ADD COLUMN IF NOT EXISTS imagen varchar(255) NULL;"
                        "ALTER TABLE producto DROP COLUMN IF EXISTS imagen_url;"
                    ),
                    reverse_sql=(
                        "ALTER TABLE producto "
                        "ADD COLUMN IF NOT EXISTS imagen_url varchar(500) NULL;"
                        "ALTER TABLE producto DROP COLUMN IF EXISTS imagen;"
                    ),
                ),
            ],
        ),
    ]
