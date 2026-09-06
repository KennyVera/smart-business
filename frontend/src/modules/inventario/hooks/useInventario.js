import { useCallback } from "react";
import {
  fetchAlertas,
  fetchCategorias,
  fetchProductos,
  fetchStock,
} from "../api/inventarioApi";
import { useRecurso } from "./useRecurso";

const VACIO = [];
const ALERTAS_VACIAS = {
  dias: 30,
  stock_critico: [],
  por_caducar: [],
  resumen: { criticos: 0, por_caducar: 0, vencidos: 0 },
};

export function useCategorias() {
  const cargar = useCallback(() => fetchCategorias(), []);
  return useRecurso(cargar, VACIO, "No se pudieron cargar las categorías.");
}

export function useProductos({ buscar, categoria }) {
  const cargar = useCallback(
    () =>
      fetchProductos({
        buscar: buscar || undefined,
        categoria: categoria || undefined,
      }),
    [buscar, categoria],
  );
  return useRecurso(cargar, VACIO, "No se pudieron cargar los productos.");
}

export function useStock({ sucursal, buscar, soloAlerta }) {
  const cargar = useCallback(
    () =>
      fetchStock({
        sucursal: sucursal || undefined,
        buscar: buscar || undefined,
        solo_alerta: soloAlerta || undefined,
      }),
    [sucursal, buscar, soloAlerta],
  );
  return useRecurso(cargar, VACIO, "No se pudo cargar el stock.");
}

export function useAlertas({ sucursal, dias }) {
  const cargar = useCallback(
    () => fetchAlertas({ sucursal: sucursal || undefined, dias }),
    [sucursal, dias],
  );
  return useRecurso(cargar, ALERTAS_VACIAS, "No se pudieron cargar las alertas.");
}
