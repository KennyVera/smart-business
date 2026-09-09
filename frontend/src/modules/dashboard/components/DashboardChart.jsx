import CategoriesDonut from "./CategoriesDonut";
import SalesLineChart from "./SalesLineChart";

function DashboardChart({ series, lineas, categorias }) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-12 col-xl-8">
        <SalesLineChart series={series} lineas={lineas} />
      </div>
      <div className="col-12 col-xl-4">
        <CategoriesDonut categorias={categorias} />
      </div>
    </div>
  );
}

export default DashboardChart;
