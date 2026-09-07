import { Eye, FileDown, Loader2 } from "lucide-react";

function ReporteCard({ reporte, activo, generando, bloqueado, onVer, onPdf }) {
  const Icono = reporte.icono;

  return (
    <article className={`rep-card${activo ? " is-activa" : ""}`}>
      <span className="rep-card-icono">
        <Icono size={20} strokeWidth={1.75} />
      </span>
      <h3>{reporte.titulo}</h3>
      <p>{reporte.detalle}</p>
      <div className="rep-card-acciones">
        <button type="button" className="btn-rep-outline" onClick={onVer}>
          <Eye size={15} strokeWidth={1.75} />
          Ver en pantalla
        </button>
        <button
          type="button"
          className="btn-rep"
          onClick={onPdf}
          disabled={bloqueado}
        >
          {generando ? (
            <Loader2 size={15} strokeWidth={2} className="rep-girando" />
          ) : (
            <FileDown size={15} strokeWidth={1.75} />
          )}
          {generando ? "Generando..." : "Descargar PDF"}
        </button>
      </div>
    </article>
  );
}

export default ReporteCard;
