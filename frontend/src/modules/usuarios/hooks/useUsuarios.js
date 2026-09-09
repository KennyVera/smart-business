import { useCallback } from "react";
import { useFilasPorPagina } from "../../../context/PreferencesContext";
import { usePaginado } from "../../../shared/usePaginado";
import { fetchUsuarios } from "../api/usuariosApi";

export function useUsuarios(pagina = 1) {
  const pageSize = useFilasPorPagina();
  const cargar = useCallback(
    () => fetchUsuarios({ page: pagina, page_size: pageSize }),
    [pagina, pageSize],
  );
  return usePaginado(cargar, "No se pudieron cargar los usuarios.");
}
