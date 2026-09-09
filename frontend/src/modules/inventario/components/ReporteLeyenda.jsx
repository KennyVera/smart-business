import { usePreferences } from "../../../context/PreferencesContext";
import { formatearDinero } from "../margen";
import { ACENTO_DEF, paletaDesdeAcento } from "../coloresReporte";

function ReporteLeyenda({ datos, medida }) {
  const { colorGraficos } = usePreferences();
  const paleta = paletaDesdeAcento(colorGraficos || ACENTO_DEF);
  if (!datos?.length) return null;

  return (
    <ul className="rep-leyenda">
      {datos.map((item, indice) => (
        <li key={item.nombre}>
          <i style={{ background: paleta[indice % paleta.length] }} />
          <span>{item.nombre}</span>
          <strong>
            {medida === "dinero" ? formatearDinero(item.valor) : item.valor}
          </strong>
        </li>
      ))}
    </ul>
  );
}

export default ReporteLeyenda;
