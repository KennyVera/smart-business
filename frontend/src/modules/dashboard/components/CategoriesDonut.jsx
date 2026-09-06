import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_SHARES, pieSlices } from "../data/categoryShares";

function CategoriesDonut() {
  const slices = pieSlices(CATEGORY_SHARES);
  const vacio = slices.length === 1 && slices[0].name === "Sin datos";

  return (
    <div className="page-card h-100">
      <h2 className="mb-2">Categorías populares</h2>
      <div className="donut-legend">
        {CATEGORY_SHARES.map((item) => (
          <span key={item.name} className="donut-legend__item">
            <i style={{ background: item.color }} />
            {item.name}
          </span>
        ))}
      </div>
      <div className="dashboard-donut-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={vacio ? 0 : 5}
              cornerRadius={6}
              stroke="#fff"
              strokeWidth={4}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [vacio ? 0 : value, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoriesDonut;
