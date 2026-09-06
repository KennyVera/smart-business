import CategoriesDonut from "./CategoriesDonut";
import SalesLineChart from "./SalesLineChart";

function DashboardChart() {
  return (
    <div className="row g-3 mb-3">
      <div className="col-12 col-xl-8">
        <SalesLineChart />
      </div>
      <div className="col-12 col-xl-4">
        <CategoriesDonut />
      </div>
    </div>
  );
}

export default DashboardChart;
