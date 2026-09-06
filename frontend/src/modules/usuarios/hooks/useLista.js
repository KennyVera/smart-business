import { useEffect, useState } from "react";

export function useLista(fetcher, mensajeError) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetcher()
      .then((response) => setItems(response.data))
      .catch(() => setError(mensajeError))
      .finally(() => setCargando(false));
  }, [fetcher, mensajeError]);

  return { items, error, cargando };
}
