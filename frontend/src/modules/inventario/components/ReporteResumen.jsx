import { formatearValor } from "../reportes";

function ReporteResumen({ datos, compacto }) {
  if (!datos?.length) return null;

  return (
    <div className={`rep-resumen${compacto ? " is-compacto" : ""}`}>
      {datos.map((dato) => (
        <div key={dato.etiqueta} className="rep-resumen-item">
          <span>{dato.etiqueta}</span>
          <strong>{formatearValor(dato.valor, dato.formato)}</strong>
        </div>
      ))}
    </div>
  );
}

export default ReporteResumen;
