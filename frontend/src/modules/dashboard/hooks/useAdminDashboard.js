import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "../api/dashboardApi";
import { CATEGORY_SHARES } from "../data/categoryShares";
import { SALES_LINES, SALES_SERIES } from "../data/salesSeries";
import { RECENT_BRANCHES } from "../data/recentBranches";

export function useAdminDashboard() {
  const [data, setData] = useState({
    series: SALES_SERIES,
    lineas: SALES_LINES,
    categorias: CATEGORY_SHARES,
    sucursales: RECENT_BRANCHES,
    cargando: true,
    error: "",
  });

  useEffect(() => {
    let vivo = true;
    fetchAdminDashboard()
      .then((response) => {
        if (!vivo) return;
        const payload = response.data || {};
        setData({
          series: payload.series?.length ? payload.series : SALES_SERIES,
          lineas: payload.lineas?.length ? payload.lineas : SALES_LINES,
          categorias: payload.categorias_populares?.length
            ? payload.categorias_populares
            : CATEGORY_SHARES,
          sucursales: payload.sucursales_recientes?.length
            ? payload.sucursales_recientes
            : RECENT_BRANCHES,
          cargando: false,
          error: "",
        });
      })
      .catch(() => {
        if (vivo) {
          setData((prev) => ({
            ...prev,
            cargando: false,
            error: "No se pudo cargar el dashboard global.",
          }));
        }
      });
    return () => {
      vivo = false;
    };
  }, []);

  return data;
}
