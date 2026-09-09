import { useEffect, useMemo, useRef, useState } from "react";
import { useFilasPorPagina } from "../context/PreferencesContext";

export const POR_PAGINA = 10;

/**
 * Corta una lista en páginas. Si no se pasa porPagina, usa la preferencia
 * del usuario (o 10 por defecto).
 */
export function usePaginacion(filas, porPagina) {
  const preferido = useFilasPorPagina();
  const tamano = porPagina ?? preferido ?? POR_PAGINA;
  const lista = filas || [];
  const total = lista.length;
  const paginas = Math.max(Math.ceil(total / tamano), 1);
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
    const inicio = (actual - 1) * tamano;
    return lista.slice(inicio, inicio + tamano);
  }, [lista, actual, tamano]);

  return {
    visibles,
    pagina: actual,
    paginas,
    total,
    desde: total === 0 ? 0 : (actual - 1) * tamano + 1,
    hasta: Math.min(actual * tamano, total),
    irA: setPagina,
    porPagina: tamano,
  };
}
