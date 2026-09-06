import { Ban, KeyRound, Monitor, Pencil } from "lucide-react";

function UsuarioAcciones({ usuario, onEditar, onClave, onDesactivar, onSesiones }) {
  return (
    <div className="usuario-acciones">
      <button type="button" title="Editar información" onClick={() => onEditar(usuario)}>
        <Pencil size={16} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Restablecer contraseña"
        disabled={!usuario.estado_activo}
        onClick={() => onClave(usuario)}
      >
        <KeyRound size={16} strokeWidth={1.75} />
      </button>
      <button type="button" title="Auditoría de sesiones" onClick={() => onSesiones(usuario)}>
        <Monitor size={16} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title={usuario.estado_activo ? "Desactivar / Suspender" : "Ya está inactivo"}
        disabled={!usuario.estado_activo}
        onClick={() => onDesactivar(usuario)}
      >
        <Ban size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export default UsuarioAcciones;
