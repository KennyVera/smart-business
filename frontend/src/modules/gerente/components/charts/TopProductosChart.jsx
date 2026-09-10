import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePreferences } from "../../../../context/PreferencesContext";
import { TOP_OPCIONES } from "../../hooks/useDashboardGerente";

function TopProductosChart({ series = [], topN = 5, onTopN }) {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || "#00aa5d";
  const datos = series.length
    ? series.map((p) => ({
        nombre: (p.nombre || "").slice(0, 18),
        unidades: Math.max(Number(p.unidades) || 0, 0),
      }))
    : [{ nombre: "Sin ventas", unidades: 0 }];

  return (
    <div className="page-card h-100">
      <div className="gerente-chart-head">
        <h2 className="mb-0">Top {topN} productos</h2>
        <select
          className="form-select form-select-sm gerente-chart-select"
          value={topN}
          onChange={(e) => onTopN?.(Number(e.target.value))}
          aria-label="Cantidad del top productos"
        >
          {TOP_OPCIONES.map((n) => (
            <option key={n} value={n}>
              Top {n}
            </option>
          ))}
        </select>
      </div>
      <div className="gerente-chart">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            key={`${acento}-${topN}`}
            data={datos}
            margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} domain={[0, "auto"]} />
            <Tooltip />
            <Bar dataKey="unidades" fill={acento} radius={[6, 6, 0, 0]} name="Unidades" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TopProductosChart;
