import { useCallback } from "react";
import { usePaginado } from "../../../shared/usePaginado";
import { fetchSucursales } from "../api/geografiaApi";

export function useSucursales(pagina = 1) {
  const cargar = useCallback(() => fetchSucursales({ page: pagina }), [pagina]);
  return usePaginado(cargar, "No se pudieron cargar las sucursales.");
}
