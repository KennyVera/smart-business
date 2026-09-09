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
import { formatearDinero } from "../margen";
import { ACENTO_DEF, paletaDesdeAcento } from "../coloresReporte";

const EJE = { fontSize: 11, fill: "#6c757d" };
const TOOLTIP = {
  borderRadius: 10,
  border: "1px solid #eef1f3",
  fontSize: "0.8rem",
};

function etiquetaPorcentaje({ percent }) {
  return percent >= 0.05 ? `${Math.round(percent * 100)}%` : "";
}

function acortarNombre(nombre = "", max = 22) {
  const texto = String(nombre);
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

function ReporteGrafico({
  tipo,
  titulo,
  datos,
  innerRef,
  medida = "dinero",
  horizontal = false,
}) {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || ACENTO_DEF;
  const paleta = paletaDesdeAcento(acento);
  if (!datos?.length) return null;

  const formatear = (valor) =>
    medida === "dinero" ? formatearDinero(valor) : String(valor);
  const filas = horizontal
    ? datos.map((item) => ({
        ...item,
        etiqueta: acortarNombre(item.nombre, 24),
      }))
    : datos;
  const altoBarras = horizontal
    ? Math.min(520, Math.max(280, filas.length * 38 + 40))
    : 280;

  return (
    <div className={`rep-grafico${horizontal ? " is-horizontal" : ""}`} ref={innerRef}>
      <p className="rep-grafico-titulo">{titulo}</p>
      <ResponsiveContainer width="100%" height={tipo === "pastel" ? 260 : altoBarras}>
        {tipo === "pastel" ? (
          <PieChart key={`pie-${acento}`}>
            <Pie
              data={datos}
              dataKey="valor"
              nameKey="nombre"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={98}
              paddingAngle={2}
              label={etiquetaPorcentaje}
              labelLine={false}
              isAnimationActive={false}
            >
              {datos.map((item, indice) => (
                <Cell key={item.nombre} fill={paleta[indice % paleta.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP}
              formatter={(valor) => formatear(valor)}
            />
          </PieChart>
        ) : horizontal ? (
          <BarChart
            key={`hbar-${acento}`}
            layout="vertical"
            data={filas}
            margin={{ top: 8, right: 28, left: 4, bottom: 8 }}
          >
            <CartesianGrid stroke="#eef1f3" horizontal={false} />
            <XAxis
              type="number"
              tick={EJE}
              tickLine={false}
              axisLine={{ stroke: "#e6eaee" }}
              tickFormatter={(valor) =>
                medida === "dinero" ? `$ ${valor}` : String(valor)
              }
            />
            <YAxis
              type="category"
              dataKey="etiqueta"
              width={148}
              tick={{ ...EJE, fontSize: 12, fill: "#343a40" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <Tooltip
              contentStyle={TOOLTIP}
              cursor={{ fill: `${acento}14` }}
              formatter={(valor) => formatear(valor)}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nombre || ""}
            />
            <Bar
              dataKey="valor"
              fill={acento}
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <BarChart
            key={`bar-${acento}`}
            data={datos}
            margin={{ top: 10, right: 12, left: 0, bottom: 64 }}
          >
            <CartesianGrid stroke="#eef1f3" vertical={false} />
            <XAxis
              dataKey="nombre"
              tick={EJE}
              tickLine={false}
              axisLine={{ stroke: "#e6eaee" }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={70}
              tickFormatter={(valor) => acortarNombre(valor, 14)}
            />
            <YAxis
              tick={EJE}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(valor) =>
                medida === "dinero" ? `$ ${valor}` : String(valor)
              }
            />
            <Tooltip
              contentStyle={TOOLTIP}
              cursor={{ fill: `${acento}14` }}
              formatter={(valor) => formatear(valor)}
            />
            <Bar
              dataKey="valor"
              fill={acento}
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default ReporteGrafico;
