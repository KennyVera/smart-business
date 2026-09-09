"""Validadores de negocio reutilizables (capa ORM / serializers)."""

from decimal import Decimal

from django.core.validators import MinValueValidator, RegexValidator

NO_NEGATIVO = MinValueValidator(
    Decimal("0"),
    message="El valor no puede ser negativo.",
)
NO_NEGATIVO_INT = MinValueValidator(
    0,
    message="La cantidad no puede ser negativa.",
)

CEDULA_O_RUC = RegexValidator(
    regex=r"^\d{10}(\d{3})?$",
    message="Debe ser Cédula (10) o RUC (13) numérico.",
)

TELEFONO_MOVIL = RegexValidator(
    regex=r"^\d{10}$",
    message="El teléfono móvil debe tener exactamente 10 dígitos.",
)

NOMBRE_PERSONA = RegexValidator(
    regex=r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$",
    message="Solo letras, espacios y guiones; sin caracteres de código.",
)
