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
import { GRANULARIDADES } from "../../hooks/useDashboardGerente";

const TITULOS = {
  hora: "Ventas por hora",
  dia: "Ventas por día",
  semana: "Ventas por semana",
};

function VentasPorHoraChart({ series = [], granularidad = "hora", onGranularidad }) {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || "#00aa5d";
  const datos = (series.length ? series : [{ etiqueta: "—", hora: "—", total: 0 }]).map(
    (fila) => ({
      etiqueta: fila.etiqueta || fila.hora || "—",
      total: Math.max(Number(fila.total) || 0, 0),
    }),
  );

  return (
    <div className="page-card h-100">
      <div className="gerente-chart-head">
        <h2 className="mb-0">{TITULOS[granularidad] || TITULOS.hora}</h2>
        <select
          className="form-select form-select-sm gerente-chart-select"
          value={granularidad}
          onChange={(e) => onGranularidad?.(e.target.value)}
          aria-label="Agrupar ventas por"
        >
          {GRANULARIDADES.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>
      <div className="gerente-chart">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart key={`${acento}-${granularidad}`} data={datos} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="etiqueta" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} domain={[0, "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke={acento}
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
