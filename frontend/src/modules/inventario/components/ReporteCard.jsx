import { Eye, FileDown, Loader2 } from "lucide-react";

function ReporteCard({
  reporte,
  activo,
  generando,
  bloqueado,
  filtros,
  onFiltros,
  onVer,
  onPdf,
}) {
  const Icono = reporte.icono;
  const conFechas = reporte.filtros === "fechas" && filtros && onFiltros;

  return (
    <article className={`rep-card${activo ? " is-activa" : ""}`}>
      <span className="rep-card-icono">
        <Icono size={20} strokeWidth={1.75} />
      </span>
      <h3>{reporte.titulo}</h3>
      <p>{reporte.detalle}</p>

      {conFechas ? (
        <div className="rep-card-crm-controles d-flex gap-2 align-items-end flex-wrap">
          <label className="rep-card-crm-campo flex-grow-1">
            <span>Desde</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtros.desde}
              max={filtros.hasta}
              disabled={bloqueado}
              onChange={(e) => onFiltros({ desde: e.target.value })}
            />
          </label>
          <label className="rep-card-crm-campo flex-grow-1">
            <span>Hasta</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtros.hasta}
              min={filtros.desde}
              disabled={bloqueado}
              onChange={(e) => onFiltros({ hasta: e.target.value })}
            />
          </label>
        </div>
      ) : null}

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
