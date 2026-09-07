from django.db.models import QuerySet
from rest_framework.pagination import PageNumberPagination

POR_PAGINA = 10
MAXIMO = 500


class PaginacionEstandar(PageNumberPagination):
    """Diez registros por página; los selectores piden más con ?page_size."""

    page_size = POR_PAGINA
    page_size_query_param = "page_size"
    max_page_size = MAXIMO


def entero(valor, defecto):
    try:
        return int(valor)
    except (TypeError, ValueError):
        return defecto


def tamano_pedido(request, defecto=POR_PAGINA):
    return min(max(entero(request.query_params.get("page_size"), defecto), 1), MAXIMO)


def pagina_manual(elementos, numero, tamano, serializer_class, **extra):
    """Misma forma que el paginador de DRF para endpoints que arman su payload."""
    total = elementos.count() if isinstance(elementos, QuerySet) else len(elementos)
    inicio = (max(numero, 1) - 1) * tamano
    trozo = elementos[inicio : inicio + tamano]
    return {
        "count": total,
        "results": serializer_class(trozo, many=True, **extra).data,
    }
