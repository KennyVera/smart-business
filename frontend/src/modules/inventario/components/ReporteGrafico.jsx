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

function ReporteGrafico({ tipo, titulo, datos, innerRef }) {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || ACENTO_DEF;
  const paleta = paletaDesdeAcento(acento);
  if (!datos?.length) return null;

  return (
    <div className="rep-grafico" ref={innerRef}>
      <p className="rep-grafico-titulo">{titulo}</p>
      <ResponsiveContainer width="100%" height={tipo === "pastel" ? 260 : 280}>
        {tipo === "pastel" ? (
          <PieChart>
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
              formatter={(valor) => formatearDinero(valor)}
            />
          </PieChart>
        ) : (
          <BarChart data={datos} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eef1f3" vertical={false} />
            <XAxis
              dataKey="nombre"
              tick={EJE}
              tickLine={false}
              axisLine={{ stroke: "#e6eaee" }}
              interval={0}
            />
            <YAxis
              tick={EJE}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(valor) => `$ ${valor}`}
            />
            <Tooltip
              contentStyle={TOOLTIP}
              cursor={{ fill: `${acento}14` }}
              formatter={(valor) => formatearDinero(valor)}
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
