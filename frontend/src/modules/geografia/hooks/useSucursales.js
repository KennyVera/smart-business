import { useCallback } from "react";
import { useFilasPorPagina } from "../../../context/PreferencesContext";
import { usePaginado } from "../../../shared/usePaginado";
import { fetchSucursales } from "../api/geografiaApi";

export function useSucursales(pagina = 1) {
  const pageSize = useFilasPorPagina();
  const cargar = useCallback(
    () => fetchSucursales({ page: pagina, page_size: pageSize }),
    [pagina, pageSize],
  );
  return usePaginado(cargar, "No se pudieron cargar las sucursales.");
}
