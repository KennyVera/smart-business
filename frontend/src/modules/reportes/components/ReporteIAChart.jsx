import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePreferences } from "../../../context/PreferencesContext";

const COLORES = ["#00aa5d", "#1c1f24", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

function esNumero(valor) {
  return typeof valor === "number" && Number.isFinite(valor);
}

/** Primera columna de texto → X; primera numérica → Y. */
export function ejesDesdeResultado(columnas, datos) {
  if (!columnas?.length || !datos?.length) {
    return { xKey: null, yKey: null, serie: [] };
  }
  const muestra = datos[0];
  const xKey =
    columnas.find((col) => typeof muestra[col] === "string") || columnas[0];
  const yKey =
    columnas.find((col) => col !== xKey && esNumero(muestra[col])) ||
    columnas.find((col) => esNumero(muestra[col])) ||
    null;
  const serie = datos.map((fila) => ({
    ...fila,
    [xKey]: String(fila[xKey] ?? "—").slice(0, 28),
    ...(yKey ? { [yKey]: Number(fila[yKey]) || 0 } : {}),
  }));
  return { xKey, yKey, serie };
}

function ReporteIAChart({ columnas, datos }) {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || "#00aa5d";
  const { xKey, yKey, serie } = ejesDesdeResultado(columnas, datos);

  if (!xKey || !yKey || serie.length === 0) {
    return (
      <p className="text-muted small mb-0">
        No hay columnas adecuadas para graficar (se necesita una etiqueta y un valor
        numérico).
      </p>
    );
  }

  const usarPie = serie.length > 0 && serie.length <= 8;

  return (
    <div className="reporte-ia-chart">
      <ResponsiveContainer width="100%" height={280}>
        {usarPie ? (
          <PieChart>
            <Pie
              data={serie}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={95}
              label={({ name }) => String(name).slice(0, 14)}
            >
              {serie.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        ) : (
          <BarChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={-22} textAnchor="end" />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={yKey} fill={acento} radius={[6, 6, 0, 0]} name={yKey} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default ReporteIAChart;
