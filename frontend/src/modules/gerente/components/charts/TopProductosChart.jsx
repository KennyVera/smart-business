import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function TopProductosChart({ series = [] }) {
  const datos = series.length
    ? series.map((p) => ({
        nombre: (p.nombre || "").slice(0, 18),
        unidades: Number(p.unidades) || 0,
      }))
    : [{ nombre: "Sin ventas", unidades: 0 }];
  return (
    <div className="page-card h-100">
      <h2 className="mb-3">Top 5 productos</h2>
      <div className="gerente-chart">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="unidades" fill="#00AA5D" radius={[6, 6, 0, 0]} name="Unidades" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TopProductosChart;
