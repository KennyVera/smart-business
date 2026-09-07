import { useEffect, useMemo, useRef, useState } from "react";

export const POR_PAGINA = 10;

/**
 * Corta una lista en páginas de tamaño fijo. Cuando cambia la cantidad de
 * registros (una búsqueda, un filtro, un alta) vuelve a la primera página.
 */
export function usePaginacion(filas, porPagina = POR_PAGINA) {
  const lista = filas || [];
  const total = lista.length;
  const paginas = Math.max(Math.ceil(total / porPagina), 1);
  const [pagina, setPagina] = useState(1);
  const totalPrevio = useRef(total);
  const actual = Math.min(pagina, paginas);

  useEffect(() => {
    if (totalPrevio.current !== total) {
      totalPrevio.current = total;
      setPagina(1);
    }
  }, [total]);

  useEffect(() => {
    if (pagina !== actual) setPagina(actual);
  }, [pagina, actual]);

  const visibles = useMemo(() => {
    const inicio = (actual - 1) * porPagina;
    return lista.slice(inicio, inicio + porPagina);
  }, [filas, actual, porPagina]);

  return {
    visibles,
    pagina: actual,
    paginas,
    total,
    desde: total === 0 ? 0 : (actual - 1) * porPagina + 1,
    hasta: Math.min(actual * porPagina, total),
    irA: setPagina,
  };
}
