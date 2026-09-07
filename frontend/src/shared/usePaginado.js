import { useCallback, useEffect, useState } from "react";
import { leerPagina } from "./paginado";

/**
 * Carga una página de la API y expone los registros con su total real,
 * el que informa el backend, no el que llegó en la página.
 */
export function usePaginado(cargar, mensajeError) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(() => {
    setCargando(true);
    return cargar()
      .then((response) => {
        setDatos(response.data);
        setError("");
      })
      .catch(() => setError(mensajeError))
      .finally(() => setCargando(false));
  }, [cargar, mensajeError]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const { items, total } = leerPagina(datos);
  return { items, total, error, cargando, recargar };
}
