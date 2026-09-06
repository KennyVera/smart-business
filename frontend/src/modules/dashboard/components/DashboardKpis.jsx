import KpiCard from "./KpiCard";
import { useDashboardKpis } from "../hooks/useDashboardKpis";

function DashboardKpis() {
  const items = useDashboardKpis();

  return (
    <div className="row g-3 mb-3">
      {items.map((item) => (
        <KpiCard key={item.id} {...item} />
      ))}
    </div>
  );
}

export default DashboardKpis;
