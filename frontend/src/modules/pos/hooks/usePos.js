import { useCallback, useEffect, useState } from "react";
import { usePaginado } from "../../../shared/usePaginado";
import { useRecurso } from "../../../shared/useRecurso";
import {
  fetchCatalogoLocal,
  fetchCategoriasPos,
  fetchMetodosPago,
  fetchTurnoActual,
} from "../api/posApi";

export const POR_PAGINA_POS = 12;

const TURNO_VACIO = { turno: null, resumen: null, terminales: [] };

/** Turno de caja del cajero logueado: manda sobre todo lo demás del POS. */
export function useTurno() {
  const [estado, setEstado] = useState(TURNO_VACIO);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = useCallback(() => {
    setCargando(true);
    return fetchTurnoActual()
      .then((response) => {
        setEstado({ ...TURNO_VACIO, ...response.data });
        setError("");
      })
      .catch(() => setError("No se pudo consultar el turno de caja."))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const aplicar = useCallback((datos) => {
    setEstado((actual) => ({ ...actual, ...datos }));
  }, []);

  return { ...estado, cargando, error, recargar, aplicar };
}

export function useCatalogoPos({ buscar, categoria, pagina = 1, turnoId }) {
  const cargar = useCallback(
    () =>
      fetchCatalogoLocal({
        buscar: buscar || undefined,
        categoria: categoria || undefined,
        page: pagina,
        page_size: POR_PAGINA_POS,
      }),
    [buscar, categoria, pagina, turnoId],
  );
  return usePaginado(cargar, "No se pudo cargar el catálogo local.");
}

export function useCategoriasPos(turnoId) {
  const cargar = useCallback(() => fetchCategoriasPos(), [turnoId]);
  return useRecurso(cargar, [], "No se pudieron cargar las categorías.");
}

export function useMetodosPago() {
  const cargar = useCallback(() => fetchMetodosPago(), []);
  return useRecurso(cargar, [], "No se pudieron cargar los métodos de pago.");
}
