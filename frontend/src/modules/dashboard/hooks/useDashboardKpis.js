import { useEffect, useState } from "react";
import { fetchSesionesResumen } from "../../usuarios/api/usuariosApi";
import { KPI_ITEMS } from "../data/kpiItems";

function conSesiones(items, resumen) {
  return items.map((item) => {
    if (item.id !== "sesiones" || !resumen) return item;
    return {
      ...item,
      value: String(resumen.total),
      delta: `${resumen.activas} en línea`,
      positive: resumen.activas > 0 ? true : null,
    };
  });
}

export function useDashboardKpis() {
  const [items, setItems] = useState(KPI_ITEMS);

  useEffect(() => {
    fetchSesionesResumen()
      .then((response) => setItems(conSesiones(KPI_ITEMS, response.data)))
      .catch(() => setItems(KPI_ITEMS));
  }, []);

  return items;
}
