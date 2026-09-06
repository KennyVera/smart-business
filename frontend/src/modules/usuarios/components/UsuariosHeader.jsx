import { Plus } from "lucide-react";

function UsuariosHeader({ onNuevo }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="mb-0">Usuarios</h2>
      <button type="button" className="btn-nuevo-usuario" onClick={onNuevo}>
        <Plus size={16} strokeWidth={2} />
        Crear Nuevo Usuario
      </button>
    </div>
  );
}

export default UsuariosHeader;
