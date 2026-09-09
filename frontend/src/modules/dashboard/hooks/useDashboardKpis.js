import { useEffect, useState } from "react";
import { fetchSesionesResumen } from "../../usuarios/api/usuariosApi";
import { fetchAdminDashboard } from "../api/dashboardApi";
import { KPI_ITEMS } from "../data/kpiItems";

function dinero(valor) {
  const n = Number(valor || 0);
  return n.toLocaleString("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function conDatos(items, dash, sesiones) {
  return items.map((item) => {
    if (item.id === "ventas" && dash?.kpis) {
      return {
        ...item,
        value: String(dash.kpis.tickets ?? 0),
        delta: "tickets del mes",
        positive: (dash.kpis.tickets || 0) > 0 ? true : null,
      };
    }
    if (item.id === "ingresos" && dash?.kpis) {
      return {
        ...item,
        value: dinero(dash.kpis.ingresos),
        delta: "ingresos totales",
        positive: Number(dash.kpis.ingresos || 0) > 0 ? true : null,
      };
    }
    if (item.id === "sesiones" && sesiones) {
      return {
        ...item,
        value: String(sesiones.total),
        delta: `${sesiones.activas} en línea`,
        positive: sesiones.activas > 0 ? true : null,
      };
    }
    if (item.id === "conversion" && dash?.kpis) {
      return {
        ...item,
        value: `${dash.kpis.conversion ?? 0}%`,
        delta: `${dash.kpis.con_cliente ?? 0} con cliente`,
        positive: (dash.kpis.conversion || 0) > 0 ? true : null,
      };
    }
    return item;
  });
}

export function useDashboardKpis() {
  const [items, setItems] = useState(KPI_ITEMS);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      fetchAdminDashboard().then((r) => r.data).catch(() => null),
      fetchSesionesResumen().then((r) => r.data).catch(() => null),
    ]).then(([dash, sesiones]) => {
      if (vivo) setItems(conDatos(KPI_ITEMS, dash, sesiones));
    });
    return () => {
      vivo = false;
    };
  }, []);

  return items;
}
