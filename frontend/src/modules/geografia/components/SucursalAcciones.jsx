import { Ban, Pencil } from "lucide-react";

function SucursalAcciones({ sucursal, onEditar, onDesactivar }) {
  return (
    <div className="sucursal-acciones" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        title="Editar"
        onClick={() => onEditar(sucursal)}
      >
        <Pencil size={16} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title={sucursal.activa ? "Desactivar / Dar de baja" : "Ya está inactiva"}
        disabled={!sucursal.activa}
        onClick={() => onDesactivar(sucursal)}
      >
        <Ban size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export default SucursalAcciones;
