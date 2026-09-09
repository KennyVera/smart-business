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
import { paletaDesdeAcento } from "../../inventario/coloresReporte";

function SalesLineChart({ series = [], lineas = [] }) {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || "#00aa5d";
  const paleta = paletaDesdeAcento(acento);
  const datos = series.length ? series : [{ mes: "—", total: 0 }];
  const keys = (
    lineas.length
      ? lineas
      : Object.keys(datos[0] || {})
          .filter((k) => k !== "mes")
          .map((key) => ({ key }))
  ).map((line, i) => ({
    key: line.key,
    color: paleta[i % paleta.length],
  }));

  return (
    <div className="page-card h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Desempeño de ventas</h2>
        <Settings size={16} className="text-muted" />
      </div>
      <div className="dashboard-chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart key={acento} data={datos} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, (max) => (max > 0 ? max : 1)]}
              allowDecimals={false}
            />
            <Tooltip />
            <Legend />
            {keys.map((line) => (
              <Line
                key={`${line.key}-${line.color}`}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
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
