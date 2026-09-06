import { useCallback, useEffect, useState } from "react";
import { fetchUsuarios } from "../api/usuariosApi";

export function useUsuarios() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(() => {
    setCargando(true);
    return fetchUsuarios()
      .then((response) => {
        setItems(response.data);
        setError("");
      })
      .catch(() => setError("No se pudieron cargar los usuarios."))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { items, error, cargando, recargar };
}
