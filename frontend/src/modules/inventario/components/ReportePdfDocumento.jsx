import { formatearValor } from "../reportes";
import ReporteLeyenda from "./ReporteLeyenda";
import ReporteTabla from "./ReporteTabla";

/**
 * Plantilla oculta que se convierte en PDF. Vive fuera de la pantalla para que
 * html2canvas pueda medirla con el ancho fijo de una hoja A4.
 */
function ReportePdfDocumento({
  innerRef,
  datos,
  columnas,
  grafico,
  imagenGrafico,
  auditoria,
  alcance,
}) {
  if (!datos) return null;

  return (
    <div className="rep-pdf-oculto" aria-hidden="true">
      <div className="rep-pdf" ref={innerRef}>
        <header className="rep-pdf-head">
          <div className="rep-pdf-marca">
            <span className="rep-pdf-logo">SB</span>
            <div>
              <strong>Smart Business</strong>
              <small>Módulo de Inventario · Reportes operativos</small>
            </div>
          </div>
          <div className="rep-pdf-meta">
            <p>
              <span>Generado por</span>
              {auditoria.usuario}
            </p>
            <p>
              <span>Rol</span>
              {auditoria.rol}
            </p>
            <p>
              <span>Fecha y hora</span>
              {auditoria.fecha} · {auditoria.hora}
            </p>
          </div>
        </header>

        <h1 className="rep-pdf-titulo">{datos.titulo}</h1>
        <p className="rep-pdf-alcance">{alcance}</p>

        <div className="rep-pdf-resumen">
          {datos.resumen.map((dato) => (
            <div key={dato.etiqueta}>
              <span>{dato.etiqueta}</span>
              <strong>{formatearValor(dato.valor, dato.formato)}</strong>
            </div>
          ))}
        </div>

        {imagenGrafico ? (
          <section className={`rep-pdf-grafico is-${grafico.tipo}`}>
            <h2>{grafico.titulo}</h2>
            <div className="rep-pdf-grafico-cuerpo">
              <img src={imagenGrafico} alt={grafico.titulo} />
              {grafico.tipo === "pastel" ? (
                <ReporteLeyenda datos={datos.grafico} medida={grafico.medida} />
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="rep-pdf-detalle">
          <h2>Detalle</h2>
          <ReporteTabla columnas={columnas} filas={datos.filas} paraPdf />
        </section>

        <footer className="rep-pdf-pie">
          Documento generado automáticamente por Smart Business · {auditoria.fecha}{" "}
          {auditoria.hora} · Uso interno / auditoría
        </footer>
      </div>
    </div>
  );
}

export default ReportePdfDocumento;
