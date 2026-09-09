import { useCallback, useEffect, useState } from "react";
import { fetchNotificaciones, marcarNotificacionLeida } from "../api/notificacionesApi";

export function useNotificaciones() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    setCargando(true);
    fetchNotificaciones()
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function marcarLeida(id) {
    try {
      const { data } = await marcarNotificacionLeida(id);
      setItems((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, ...data, leida: true } : n))
      );
    } catch {
      /* el badge no cambia si falla */
    }
  }

  const noLeidas = items.filter((n) => !n.leida).length;
  return { items, cargando, noLeidas, marcarLeida, recargar: cargar };
}
