import { AtSign, CircleDot, Shield, Store, UserRound, Wrench } from "lucide-react";
import UsuarioAcciones from "./UsuarioAcciones";
import UsuarioEstado from "./UsuarioEstado";

function UsuariosTable({ usuarios, onEditar, onClave, onDesactivar, onSesiones }) {
  if (usuarios.length === 0) {
    return <p className="text-muted mb-0">Aún no hay usuarios registrados.</p>;
  }

  return (
    <div className="table-responsive usuarios-wrap">
      <table className="table usuarios-table align-middle mb-0">
        <thead>
          <tr>
            <th><span className="usuarios-th"><AtSign size={13} /> Usuario</span></th>
            <th><span className="usuarios-th"><UserRound size={13} /> Nombre</span></th>
            <th><span className="usuarios-th"><Shield size={13} /> Rol</span></th>
            <th><span className="usuarios-th"><Store size={13} /> Sucursal</span></th>
            <th><span className="usuarios-th"><CircleDot size={13} /> Estado</span></th>
            <th className="text-end">
              <span className="usuarios-th"><Wrench size={13} /> Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td className="usuario-username">{usuario.username}</td>
              <td>{usuario.nombre_completo}</td>
              <td>{usuario.rol_nombre}</td>
              <td className="text-muted">{usuario.sucursal_nombre || "—"}</td>
              <td>
                <UsuarioEstado activo={usuario.estado_activo} />
              </td>
              <td>
                <UsuarioAcciones
                  usuario={usuario}
                  onEditar={onEditar}
                  onClave={onClave}
                  onDesactivar={onDesactivar}
                  onSesiones={onSesiones}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosTable;
