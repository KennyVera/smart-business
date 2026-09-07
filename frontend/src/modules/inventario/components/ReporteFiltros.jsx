import { CalendarRange, History } from "lucide-react";
import { VENTANAS_ROTACION } from "../reportes";

function ReporteFiltros({ reporte, filtros, onCambio }) {
  if (reporte.filtros === "fechas") {
    return (
      <div className="rep-filtros">
        <CalendarRange size={15} strokeWidth={1.75} />
        <label>
          Desde
          <input
            type="date"
            className="form-control"
            value={filtros.desde}
            max={filtros.hasta}
            onChange={(event) => onCambio({ desde: event.target.value })}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            className="form-control"
            value={filtros.hasta}
            min={filtros.desde}
            onChange={(event) => onCambio({ hasta: event.target.value })}
          />
        </label>
      </div>
    );
  }

  if (reporte.filtros === "dias") {
    return (
      <div className="rep-filtros">
        <History size={15} strokeWidth={1.75} />
        <label>
          Rotación
          <select
            className="form-select"
            value={filtros.dias}
            onChange={(event) => onCambio({ dias: Number(event.target.value) })}
          >
            {VENTANAS_ROTACION.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  return null;
}

export default ReporteFiltros;
