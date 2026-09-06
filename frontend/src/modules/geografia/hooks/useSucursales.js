import { useCallback, useEffect, useState } from "react";
import { fetchSucursales } from "../api/geografiaApi";

export function useSucursales() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(() => {
    setCargando(true);
    return fetchSucursales()
      .then((response) => {
        setItems(response.data);
        setError("");
      })
      .catch(() => setError("No se pudieron cargar las sucursales."))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { items, error, cargando, recargar };
}
