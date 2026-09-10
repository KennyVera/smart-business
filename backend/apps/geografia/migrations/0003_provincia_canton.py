from django.db import models
import django.db.models.deletion
from django.db import migrations


class Migration(migrations.Migration):
    """Renombra Subzona→Provincia y CantonDistrito→Canton (división política)."""

    dependencies = [
        ("geografia", "0002_sucursal_fecha_cierre"),
    ]

    operations = [
        migrations.RenameModel(old_name="Subzona", new_name="Provincia"),
        migrations.RenameModel(old_name="CantonDistrito", new_name="Canton"),
        migrations.AlterModelOptions(
            name="provincia",
            options={
                "ordering": ["nombre"],
                "verbose_name": "Provincia",
                "verbose_name_plural": "Provincias",
            },
        ),
        migrations.AlterModelOptions(
            name="canton",
            options={
                "ordering": ["nombre"],
                "verbose_name": "Cantón",
                "verbose_name_plural": "Cantones",
            },
        ),
        migrations.RenameField(
            model_name="canton",
            old_name="subzona",
            new_name="provincia",
        ),
        migrations.AlterField(
            model_name="provincia",
            name="zona",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="provincias",
                to="geografia.zonaplanificacion",
            ),
        ),
        migrations.AlterField(
            model_name="canton",
            name="provincia",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="cantones",
                to="geografia.provincia",
            ),
        ),
        migrations.AlterField(
            model_name="sucursal",
            name="canton",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="sucursales",
                to="geografia.canton",
            ),
        ),
    ]
