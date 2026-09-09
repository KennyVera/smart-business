import { Eye, FileDown, Loader2, Users } from "lucide-react";

const TIPOS = [
  { value: "top_gastos", label: "Top Mayor Gasto" },
  { value: "top_visitas", label: "Top Más Frecuentes" },
  { value: "cumpleanos_mes", label: "Cumpleañeros del mes" },
];

function ReporteCardCrm({
  activo,
  generando,
  bloqueado,
  tipo,
  limite,
  onTipo,
  onLimite,
  onVer,
  onPdf,
}) {
  return (
    <article className={`rep-card rep-card-crm${activo ? " is-activa" : ""}`}>
      <span className="rep-card-icono">
        <Users size={20} strokeWidth={1.75} />
      </span>
      <h3>Inteligencia de Clientes (CRM)</h3>
      <p>
        Filtra y exporta el listado de tus mejores clientes o cumpleañeros para
        campañas de fidelización.
      </p>

      <div className="rep-card-crm-controles d-flex gap-2 align-items-end flex-wrap">
        <label className="rep-card-crm-campo flex-grow-1">
          <span>Tipo</span>
          <select
            className="form-select form-select-sm"
            value={tipo}
            onChange={(e) => onTipo(e.target.value)}
            disabled={bloqueado}
          >
            {TIPOS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </label>
        <label className="rep-card-crm-campo">
          <span>Cantidad</span>
          <input
            type="number"
            className="form-control form-control-sm"
            min={1}
            max={100}
            value={limite}
            placeholder="Ej: 10"
            onChange={(e) => onLimite(e.target.value)}
            disabled={bloqueado}
          />
        </label>
      </div>

      <div className="rep-card-acciones">
        <button type="button" className="btn-rep-outline" onClick={onVer} disabled={bloqueado}>
          <Eye size={15} strokeWidth={1.75} />
          Ver en pantalla
        </button>
        <button type="button" className="btn-rep" onClick={onPdf} disabled={bloqueado}>
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

export default ReporteCardCrm;
export { TIPOS as TIPOS_CRM };
