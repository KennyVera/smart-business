import DashboardChart from "../components/DashboardChart";
import DashboardKpis from "../components/DashboardKpis";
import DashboardTable from "../components/DashboardTable";
import "../dashboard.css";

function AdminDashboardPage() {
  return (
    <div className="dashboard-page">
      <DashboardKpis />
      <DashboardChart />
      <DashboardTable />
    </div>
  );
}

export default AdminDashboardPage;
