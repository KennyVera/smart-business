from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventario", "0002_historialmovimiento"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="producto",
                    name="imagen_url",
                    field=models.URLField(blank=True, max_length=500, null=True),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE producto "
                        "ADD COLUMN IF NOT EXISTS imagen_url varchar(500) NULL;"
                    ),
                    reverse_sql="ALTER TABLE producto DROP COLUMN IF EXISTS imagen_url;",
                ),
            ],
        ),
    ]
