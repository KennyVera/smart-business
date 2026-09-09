import { Filter } from "lucide-react";
import { fechaMinAuditoria, hoyISO } from "../formato";

function FiltrosAuditoria({
  desde,
  hasta,
  errorFecha,
  onDesde,
  onHasta,
  onFiltrar,
}) {
  const min = fechaMinAuditoria();
  const max = hoyISO();

  return (
    <form
      className="page-card gerente-filtros mb-3"
      onSubmit={(e) => {
        e.preventDefault();
        onFiltrar();
      }}
    >
      <label className="gerente-filtro-campo">
        <span>Desde</span>
        <input
          type="date"
          className="form-control"
          value={desde}
          min={min}
          max={hasta < max ? hasta : max}
          required
          onChange={(e) => onDesde(e.target.value)}
        />
      </label>
      <label className="gerente-filtro-campo">
        <span>Hasta</span>
        <input
          type="date"
          className="form-control"
          value={hasta}
          min={desde > min ? desde : min}
          max={max}
          required
          onChange={(e) => onHasta(e.target.value)}
        />
      </label>
      <button type="submit" className="btn gerente-btn">
        <Filter size={16} strokeWidth={2} />
        Filtrar
      </button>
      {errorFecha ? (
        <p className="gerente-filtro-error mb-0 w-100">{errorFecha}</p>
      ) : (
        <p className="gerente-filtro-hint mb-0 w-100">
          Solo fechas de los últimos 2 años, hasta hoy.
        </p>
      )}
    </form>
  );
}

export default FiltrosAuditoria;
