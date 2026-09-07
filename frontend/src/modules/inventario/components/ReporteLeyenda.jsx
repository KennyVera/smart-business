import { formatearDinero } from "../margen";
import { PALETA } from "../reportes";

function ReporteLeyenda({ datos, medida }) {
  if (!datos?.length) return null;

  return (
    <ul className="rep-leyenda">
      {datos.map((item, indice) => (
        <li key={item.nombre}>
          <i style={{ background: PALETA[indice % PALETA.length] }} />
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
