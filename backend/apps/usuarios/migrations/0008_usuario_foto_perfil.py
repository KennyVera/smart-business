from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0007_usuario_email"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="usuario",
                    name="foto_perfil",
                    field=models.ImageField(
                        blank=True,
                        max_length=255,
                        null=True,
                        upload_to="perfiles/",
                    ),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE usuario
                            ADD COLUMN IF NOT EXISTS foto_perfil varchar(255) NULL;
                    """,
                    reverse_sql="""
                        ALTER TABLE usuario DROP COLUMN IF EXISTS foto_perfil;
                    """,
                ),
            ],
        ),
    ]
