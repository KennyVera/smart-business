import { Plus } from "lucide-react";

function SucursalesHeader({ onNueva }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="mb-0">Sucursales</h2>
      <button type="button" className="btn-nueva-sucursal" onClick={onNueva}>
        <Plus size={16} strokeWidth={2} />
        Nueva Sucursal
      </button>
    </div>
  );
}

export default SucursalesHeader;
