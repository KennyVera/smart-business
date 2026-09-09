import { usePreferences } from "../../../context/PreferencesContext";
import { ACENTO_DEF, varsAcento } from "../coloresReporte";
import { formatearValor, textoPeriodo } from "../reportes";
import ReporteLeyenda from "./ReporteLeyenda";
import ReporteTabla from "./ReporteTabla";

/**
 * Plantilla oculta que se convierte en PDF. El acento va en el nodo capturado
 * (html2canvas no hereda bien variables CSS del padre).
 */
function ReportePdfDocumento({
  innerRef,
  datos,
  columnas,
  grafico,
  imagenGrafico,
  auditoria,
  alcance,
  landscape = false,
}) {
  const { colorGraficos, logoPersonalizado } = usePreferences();
  const acento = colorGraficos || ACENTO_DEF;
  const tema = varsAcento(acento);
  const periodo = textoPeriodo(datos?.periodo);
  if (!datos) return null;

  return (
    <div
      className={`rep-pdf-oculto${landscape ? " is-landscape" : ""}`}
      aria-hidden="true"
    >
      <div
        className={`rep-pdf${landscape ? " is-landscape" : ""}`}
        ref={innerRef}
        style={tema}
      >
        <header className="rep-pdf-head" style={{ borderBottomColor: acento }}>
          <div className="rep-pdf-marca">
            {logoPersonalizado ? (
              <img
                src={logoPersonalizado}
                alt="Logo"
                className="rep-pdf-logo-img"
              />
            ) : (
              <span
                className="rep-pdf-logo"
                style={{ background: acento }}
                aria-hidden="true"
              />
            )}
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
        {periodo ? <p className="rep-pdf-periodo">{periodo}</p> : null}
        <p className="rep-pdf-alcance">{alcance}</p>

        <div className="rep-pdf-resumen">
          {datos.resumen.map((dato) => (
            <div key={dato.etiqueta} style={{ borderLeftColor: acento }}>
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
          <ReporteTabla
            columnas={columnas}
            filas={datos.filas}
            paraPdf
            colorAcento={acento}
          />
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
