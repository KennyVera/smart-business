import KpisCierre from "../components/KpisCierre";
import TablaCajeros from "../components/TablaCajeros";
import TopProductosChart from "../components/charts/TopProductosChart";
import VentasPorHoraChart from "../components/charts/VentasPorHoraChart";
import { useDashboardGerente } from "../hooks/useDashboardGerente";
import "../gerente.css";

function DashboardGerente() {
  const {
    data,
    cierre,
    error,
    cargando,
    topN,
    setTopN,
    granularidad,
    setGranularidad,
  } = useDashboardGerente();
  const sucursal = data?.sucursal || cierre?.sucursal || "tu sucursal";

  return (
    <div className="gerente-page">
      <header className="gerente-page-head">
        <div>
          <p className="gerente-eyebrow">Gerente de sucursal</p>
          <h1>Rendimiento — {sucursal}</h1>
        </div>
      </header>
      {error ? <p className="text-danger">{error}</p> : null}
      {cargando ? <p className="text-muted">Cargando…</p> : null}
      <KpisCierre cierre={cierre} />
      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-7">
          <VentasPorHoraChart
            series={data?.ventas_tiempo || data?.ventas_por_hora}
            granularidad={granularidad}
            onGranularidad={setGranularidad}
          />
        </div>
        <div className="col-12 col-xl-5">
          <TopProductosChart
            series={data?.top_productos}
            topN={topN}
            onTopN={setTopN}
          />
        </div>
      </div>
      <TablaCajeros filas={data?.ventas_por_cajero} />
    </div>
  );
}

export default DashboardGerente;
