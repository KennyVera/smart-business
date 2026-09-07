import { useEffect, useState } from "react";

export const POR_PAGINA = 10;

/** Tope que acepta el backend; se usa para llenar selectores completos. */
export const TODOS = 500;

/** Acepta tanto la respuesta paginada de DRF como una lista suelta. */
export function leerPagina(data) {
  if (Array.isArray(data)) return { items: data, total: data.length };
  return { items: data?.results || [], total: data?.count || 0 };
}

export function datosPaginacion(pagina, total, porPagina = POR_PAGINA) {
  const paginas = Math.max(Math.ceil(total / porPagina), 1);
  const actual = Math.min(pagina, paginas);
  return {
    pagina: actual,
    paginas,
    total,
    desde: total === 0 ? 0 : (actual - 1) * porPagina + 1,
    hasta: Math.min(actual * porPagina, total),
  };
}

/** Vuelve a la página 1 cada vez que cambian los filtros que forman la clave. */
export function usePagina(clave = "") {
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [clave]);

  return [pagina, setPagina];
}
