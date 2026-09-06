import { useCallback, useEffect, useState } from "react";

export function useRecurso(cargar, inicial, mensajeError) {
  const [datos, setDatos] = useState(inicial);
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

  return { datos, error, cargando, recargar };
}

export function useDebounce(valor, espera = 250) {
  const [diferido, setDiferido] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setDiferido(valor), espera);
    return () => clearTimeout(id);
  }, [valor, espera]);

  return diferido;
}
