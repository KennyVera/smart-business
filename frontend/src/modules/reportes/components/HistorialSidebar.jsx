import { History, Trash2 } from "lucide-react";

function formatearFecha(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncar(texto, max = 72) {
  const limpio = (texto || "").trim();
  if (limpio.length <= max) return limpio;
  return `${limpio.slice(0, max - 1)}…`;
}

function HistorialSidebar({
  items,
  activoId,
  cargando,
  onSeleccionar,
  onEliminar,
  onNuevo,
}) {
  return (
    <aside className="reporte-ia-historial">
      <div className="reporte-ia-historial-head">
        <h2>
          <History size={16} strokeWidth={2} />
          Historial
        </h2>
        <button type="button" className="btn btn-sm btn-light" onClick={onNuevo}>
          Nuevo
        </button>
      </div>
      {cargando ? (
        <p className="text-muted small px-3">Cargando…</p>
      ) : null}
      {!cargando && items.length === 0 ? (
        <p className="text-muted small px-3 mb-0">
          Aún no hay reportes. Genera el primero a la derecha.
        </p>
      ) : null}
      <ul className="reporte-ia-historial-lista">
        {items.map((item) => {
          const activo = item.id === activoId;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`reporte-ia-historial-item${activo ? " is-activo" : ""}`}
                onClick={() => onSeleccionar(item.id)}
                title={item.prompt_usuario}
              >
                <span className="reporte-ia-historial-prompt">
                  {truncar(item.prompt_usuario)}
                </span>
                <span className="reporte-ia-historial-fecha">
                  {formatearFecha(item.fecha_creacion)}
                </span>
              </button>
              <button
                type="button"
                className="reporte-ia-historial-borrar"
                title="Eliminar reporte"
                onClick={(evento) => {
                  evento.stopPropagation();
                  onEliminar(item);
                }}
              >
                <Trash2 size={15} strokeWidth={1.75} />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default HistorialSidebar;
