import { useEffect, useState } from "react";
import { mensajeApi } from "../../usuarios/rol";
import { fetchCierreDiario, fetchDashboardGerente } from "../api/gerenteApi";

export function useDashboardGerente() {
  const [data, setData] = useState(null);
  const [cierre, setCierre] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.all([fetchDashboardGerente(), fetchCierreDiario()])
      .then(([dash, cie]) => {
        if (!vivo) return;
        setData(dash.data);
        setCierre(cie.data);
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
  }, []);

  return { data, cierre, error, cargando };
}
