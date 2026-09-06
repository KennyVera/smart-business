from rest_framework import serializers

from .models import CantonDistrito, Subzona, Sucursal, ZonaPlanificacion


class ZonaPlanificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaPlanificacion
        fields = ("id_nombre", "nombre", "codigo", "descripcion")


class SubzonaSerializer(serializers.ModelSerializer):
    zona_nombre = serializers.CharField(source="zona.nombre", read_only=True)

    class Meta:
        model = Subzona
        fields = ("id_nombre", "nombre", "zona", "zona_nombre")


class CantonDistritoSerializer(serializers.ModelSerializer):
    subzona_nombre = serializers.CharField(source="subzona.nombre", read_only=True)
    zona_nombre = serializers.CharField(source="subzona.zona.nombre", read_only=True)

    class Meta:
        model = CantonDistrito
        fields = (
            "id_nombre",
            "nombre",
            "subzona",
            "subzona_nombre",
            "zona_nombre",
        )


class SucursalSerializer(serializers.ModelSerializer):
    canton_nombre = serializers.CharField(source="canton.nombre", read_only=True)
    zona_nombre = serializers.CharField(
        source="canton.subzona.zona.nombre",
        read_only=True,
    )

    class Meta:
        model = Sucursal
        fields = (
            "id_nombre",
            "nombre",
            "canton",
            "canton_nombre",
            "zona_nombre",
            "direccion",
            "telefono",
            "activa",
            "fecha_apertura",
            "fecha_cierre",
        )
        read_only_fields = ("id_nombre", "fecha_cierre")
