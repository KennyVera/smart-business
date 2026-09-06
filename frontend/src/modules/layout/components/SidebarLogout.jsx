import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logout } from "../../usuarios/api/authApi";
import { borrarSesion } from "../../usuarios/auth/sesion";

function SidebarLogout() {
  const navigate = useNavigate();

  async function cerrar() {
    try {
      await logout();
    } catch {
      /* se limpia la sesión local de todos modos */
    }
    borrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <button
      type="button"
      className="sidebar-link sidebar-logout"
      title="Cerrar sesión"
      onClick={cerrar}
    >
      <LogOut size={20} strokeWidth={1.75} />
      <span>Cerrar sesión</span>
    </button>
  );
}

export default SidebarLogout;
