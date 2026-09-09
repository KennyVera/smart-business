from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0006_notificacion"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="usuario",
                    name="email",
                    field=models.CharField(blank=True, max_length=100, null=True),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE usuario
                            ADD COLUMN IF NOT EXISTS email varchar(100) NULL;
                    """,
                    reverse_sql="""
                        ALTER TABLE usuario DROP COLUMN IF EXISTS email;
                    """,
                ),
            ],
        ),
    ]
