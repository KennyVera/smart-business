from rest_framework import serializers

from .models import Canton, Provincia, Sucursal, ZonaPlanificacion


class ZonaPlanificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaPlanificacion
        fields = ("id_nombre", "nombre", "codigo", "descripcion")


class ProvinciaSerializer(serializers.ModelSerializer):
    zona_nombre = serializers.CharField(source="zona.nombre", read_only=True)
    zona_codigo = serializers.IntegerField(source="zona.codigo", read_only=True)

    class Meta:
        model = Provincia
        fields = (
            "id_nombre",
            "nombre",
            "zona",
            "zona_nombre",
            "zona_codigo",
        )


class CantonSerializer(serializers.ModelSerializer):
    provincia_nombre = serializers.CharField(source="provincia.nombre", read_only=True)
    zona = serializers.CharField(source="provincia.zona_id", read_only=True)
    zona_nombre = serializers.CharField(source="provincia.zona.nombre", read_only=True)
    zona_codigo = serializers.IntegerField(source="provincia.zona.codigo", read_only=True)

    class Meta:
        model = Canton
        fields = (
            "id_nombre",
            "nombre",
            "provincia",
            "provincia_nombre",
            "zona",
            "zona_nombre",
            "zona_codigo",
        )


class SucursalSerializer(serializers.ModelSerializer):
    canton_nombre = serializers.CharField(source="canton.nombre", read_only=True)
    provincia = serializers.CharField(source="canton.provincia_id", read_only=True)
    provincia_nombre = serializers.CharField(
        source="canton.provincia.nombre",
        read_only=True,
    )
    zona_nombre = serializers.CharField(
        source="canton.provincia.zona.nombre",
        read_only=True,
    )
    zona_codigo = serializers.IntegerField(
        source="canton.provincia.zona.codigo",
        read_only=True,
    )

    class Meta:
        model = Sucursal
        fields = (
            "id_nombre",
            "nombre",
            "canton",
            "canton_nombre",
            "provincia",
            "provincia_nombre",
            "zona_nombre",
            "zona_codigo",
            "direccion",
            "telefono",
            "activa",
            "fecha_apertura",
            "fecha_cierre",
        )
        read_only_fields = ("id_nombre", "fecha_cierre")


# Compatibilidad con imports antiguos.
SubzonaSerializer = ProvinciaSerializer
CantonDistritoSerializer = CantonSerializer
