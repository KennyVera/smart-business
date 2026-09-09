import DashboardChart from "../components/DashboardChart";
import DashboardKpis from "../components/DashboardKpis";
import DashboardTable from "../components/DashboardTable";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import "../dashboard.css";

function AdminDashboardPage() {
  const { series, lineas, categorias, sucursales, error, cargando } =
    useAdminDashboard();

  return (
    <div className="dashboard-page">
      {error ? <p className="text-danger mb-2">{error}</p> : null}
      {cargando ? <p className="text-muted mb-2">Cargando dashboard…</p> : null}
      <DashboardKpis />
      <DashboardChart series={series} lineas={lineas} categorias={categorias} />
      <DashboardTable sucursales={sucursales} />
    </div>
  );
}

export default AdminDashboardPage;
