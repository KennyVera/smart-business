import { Printer, X } from "lucide-react";

function SeleccionBarra({ total, onImprimir, onLimpiar }) {
  if (total === 0) return null;

  return (
    <div className="inv-seleccion-barra">
      <span>
        <strong>{total}</strong> {total === 1 ? "producto" : "productos"} en selección
      </span>
      <button type="button" className="btn-inv" onClick={onImprimir}>
        <Printer size={16} strokeWidth={2} />
        Imprimir etiquetas de código de barras (PDF)
      </button>
      <button
        type="button"
        className="inv-seleccion-limpiar"
        title="Limpiar selección"
        onClick={onLimpiar}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default SeleccionBarra;
