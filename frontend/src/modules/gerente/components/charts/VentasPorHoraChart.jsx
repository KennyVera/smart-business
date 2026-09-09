import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePreferences } from "../../../../context/PreferencesContext";

function VentasPorHoraChart({ series = [] }) {
  const { colorGraficos } = usePreferences();
  const datos = series.length ? series : [{ hora: "—", total: 0 }];
  return (
    <div className="page-card h-100">
      <h2 className="mb-3">Ventas por hora</h2>
      <div className="gerente-chart">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={datos} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="hora" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke={colorGraficos || "#00AA5D"}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default VentasPorHoraChart;
