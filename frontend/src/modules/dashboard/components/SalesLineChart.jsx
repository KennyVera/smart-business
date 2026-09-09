import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Settings } from "lucide-react";
import { usePreferences } from "../../../context/PreferencesContext";
import { SALES_LINES, SALES_SERIES } from "../data/salesSeries";

function SalesLineChart() {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || "#00AA5D";

  return (
    <div className="page-card h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Desempeño de ventas</h2>
        <Settings size={16} className="text-muted" />
      </div>
      <div className="dashboard-chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={SALES_SERIES} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, (max) => (max > 0 ? max : 1)]}
              allowDecimals={false}
            />
            <Tooltip />
            <Legend />
            {SALES_LINES.map((line, i) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={i === 0 ? acento : line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesLineChart;
