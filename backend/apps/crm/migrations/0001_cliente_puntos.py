from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name="Cliente",
                    fields=[
                        (
                            "id_cliente",
                            models.AutoField(primary_key=True, serialize=False),
                        ),
                        (
                            "cedula_ruc",
                            models.CharField(
                                blank=True,
                                db_column="cedula",
                                max_length=13,
                                null=True,
                                unique=True,
                            ),
                        ),
                        ("nombres", models.CharField(max_length=100)),
                        ("apellidos", models.CharField(max_length=100)),
                        (
                            "correo",
                            models.CharField(
                                blank=True,
                                db_column="email",
                                max_length=100,
                                null=True,
                            ),
                        ),
                        (
                            "telefono",
                            models.CharField(blank=True, max_length=15, null=True),
                        ),
                        ("puntos_acumulados", models.IntegerField(default=0)),
                        ("fecha_nacimiento", models.DateField(blank=True, null=True)),
                        (
                            "fecha_registro",
                            models.DateTimeField(auto_now_add=True),
                        ),
                    ],
                    options={
                        "verbose_name": "Cliente",
                        "verbose_name_plural": "Clientes",
                        "db_table": "cliente",
                        "ordering": ["apellidos", "nombres"],
                        "managed": False,
                    },
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE cliente "
                        "ADD COLUMN IF NOT EXISTS puntos_acumulados integer "
                        "NOT NULL DEFAULT 0;"
                    ),
                    reverse_sql=(
                        "ALTER TABLE cliente DROP COLUMN IF EXISTS puntos_acumulados;"
                    ),
                ),
            ],
        ),
    ]
