import { useEffect, useState } from "react";
import { mensajeApi } from "../../usuarios/rol";
import { fetchCierreDiario, fetchDashboardGerente } from "../api/gerenteApi";

export const TOP_OPCIONES = [5, 10, 20];
export const GRANULARIDADES = [
  { value: "hora", label: "Por hora" },
  { value: "dia", label: "Por día" },
  { value: "semana", label: "Por semana" },
];

export function useDashboardGerente() {
  const [data, setData] = useState(null);
  const [cierre, setCierre] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [topN, setTopN] = useState(5);
  const [granularidad, setGranularidad] = useState("hora");

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    Promise.all([
      fetchDashboardGerente({ top: topN, granularidad }),
      fetchCierreDiario(),
    ])
      .then(([dash, cie]) => {
        if (!vivo) return;
        setData(dash.data);
        setCierre(cie.data);
        setError("");
      })
      .catch((err) => {
        if (vivo) setError(mensajeApi(err, "No se pudo cargar el dashboard."));
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [topN, granularidad]);

  return {
    data,
    cierre,
    error,
    cargando,
    topN,
    setTopN,
    granularidad,
    setGranularidad,
  };
}
