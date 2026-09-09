import { usePreferences } from "../../../context/PreferencesContext";
import { ACENTO_DEF } from "../coloresReporte";
import { formatearValor } from "../reportes";

function ReporteResumen({ datos, compacto }) {
  const { colorGraficos } = usePreferences();
  const acento = colorGraficos || ACENTO_DEF;
  if (!datos?.length) return null;

  return (
    <div className={`rep-resumen${compacto ? " is-compacto" : ""}`}>
      {datos.map((dato) => (
        <div
          key={dato.etiqueta}
          className="rep-resumen-item"
          style={{ borderLeftColor: acento }}
        >
          <span>{dato.etiqueta}</span>
          <strong>{formatearValor(dato.valor, dato.formato)}</strong>
        </div>
      ))}
    </div>
  );
}

export default ReporteResumen;
