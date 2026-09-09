import { useCallback } from "react";
import { useFilasPorPagina } from "../../../context/PreferencesContext";
import { usePaginado } from "../../../shared/usePaginado";
import {
  fetchAlertas,
  fetchCategorias,
  fetchCategoriasTodas,
  fetchProductos,
  fetchStock,
} from "../api/inventarioApi";
import { useRecurso } from "./useRecurso";

const ALERTAS_VACIAS = {
  dias: 30,
  stock_critico: { count: 0, results: [] },
  por_caducar: { count: 0, results: [] },
  resumen: { criticos: 0, por_caducar: 0, vencidos: 0 },
};

export function useCategorias(pagina = 1) {
  const pageSize = useFilasPorPagina();
  const cargar = useCallback(
    () => fetchCategorias({ page: pagina, page_size: pageSize }),
    [pagina, pageSize],
  );
  return usePaginado(cargar, "No se pudieron cargar las categorías.");
}

/** Catálogo completo de categorías para los <select>. */
export function useCategoriasTodas() {
  const cargar = useCallback(() => fetchCategoriasTodas(), []);
  return useRecurso(cargar, [], "No se pudieron cargar las categorías.");
}

export function useProductos({ buscar, categoria, margen, pagina = 1 }) {
  const pageSize = useFilasPorPagina();
  const cargar = useCallback(
    () =>
      fetchProductos({
        buscar: buscar || undefined,
        categoria: categoria || undefined,
        margen: margen || undefined,
        page: pagina,
        page_size: pageSize,
      }),
    [buscar, categoria, margen, pagina, pageSize],
  );
  return usePaginado(cargar, "No se pudieron cargar los productos.");
}

export function useStock({ sucursal, buscar, soloAlerta, pagina = 1 }) {
  const pageSize = useFilasPorPagina();
  const cargar = useCallback(
    () =>
      fetchStock({
        sucursal: sucursal || undefined,
        buscar: buscar || undefined,
        solo_alerta: soloAlerta || undefined,
        page: pagina,
        page_size: pageSize,
      }),
    [sucursal, buscar, soloAlerta, pagina, pageSize],
  );
  return usePaginado(cargar, "No se pudo cargar el stock.");
}

export function useAlertas({ sucursal, dias, paginaCritico = 1, paginaCaducar = 1 }) {
  const pageSize = useFilasPorPagina();
  const cargar = useCallback(
    () =>
      fetchAlertas({
        sucursal: sucursal || undefined,
        dias,
        pagina_critico: paginaCritico,
        pagina_caducar: paginaCaducar,
        page_size: pageSize,
      }),
    [sucursal, dias, paginaCritico, paginaCaducar, pageSize],
  );
  return useRecurso(cargar, ALERTAS_VACIAS, "No se pudieron cargar las alertas.");
}
