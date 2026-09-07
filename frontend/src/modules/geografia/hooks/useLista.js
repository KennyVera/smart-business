import { useEffect, useState } from "react";
import { leerPagina } from "../../../shared/paginado";

export function useLista(fetcher, mensajeError) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    fetcher()
      .then((response) => setDatos(response.data))
      .catch(() => setError(mensajeError))
      .finally(() => setCargando(false));
  }, [fetcher, mensajeError]);

  const { items, total } = leerPagina(datos);
  return { items, total, error, cargando };
}
