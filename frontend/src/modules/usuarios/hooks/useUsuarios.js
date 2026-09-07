import { useCallback } from "react";
import { usePaginado } from "../../../shared/usePaginado";
import { fetchUsuarios } from "../api/usuariosApi";

export function useUsuarios(pagina = 1) {
  const cargar = useCallback(() => fetchUsuarios({ page: pagina }), [pagina]);
  return usePaginado(cargar, "No se pudieron cargar los usuarios.");
}
