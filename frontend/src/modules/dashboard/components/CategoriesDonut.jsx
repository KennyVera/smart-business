import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { usePreferences } from "../../../context/PreferencesContext";
import { paletaDesdeAcento } from "../../inventario/coloresReporte";
import { pieSlices } from "../data/categoryShares";

function CategoriesDonut({ categorias = [] }) {
  const { colorGraficos } = usePreferences();
  const paleta = paletaDesdeAcento(colorGraficos || "#00aa5d");
  const conColor = (categorias.length ? categorias : []).map((item, i) => ({
    ...item,
    color: paleta[i % paleta.length],
  }));
  const slices = pieSlices(conColor.length ? conColor : categorias).map(
    (item, i) => ({
      ...item,
      color: item.name === "Sin datos" ? "#eceff1" : paleta[i % paleta.length],
    }),
  );
  const vacio = slices.length === 1 && slices[0].name === "Sin datos";
  const leyenda = conColor.length ? conColor : slices;

  return (
    <div className="page-card h-100">
      <h2 className="mb-2">Categorías populares</h2>
      <div className="donut-legend">
        {leyenda.map((item) => (
          <span key={item.name} className="donut-legend__item">
            <i style={{ background: item.color }} />
            {item.name}
          </span>
        ))}
      </div>
      <div className="dashboard-donut-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart key={colorGraficos || "donut"}>
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
