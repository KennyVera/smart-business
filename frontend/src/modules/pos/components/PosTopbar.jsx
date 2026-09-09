import {
  FileBarChart,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Package,
  ShoppingCart,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../usuarios/api/authApi";
import { borrarSesion, iniciales, leerSesion, rolDeSesion } from "../../usuarios/auth/sesion";
import RelojPos from "./RelojPos";

/** El cajero solo vende: catálogo y reportes quedan fuera de su menú. */
const ROLES_CATALOGO = ["administrador", "gerente", "bodeguero"];
const ROLES_REPORTES = ["administrador", "gerente"];

function PosTopbar({ turno, onCerrarTurno }) {
  const navigate = useNavigate();
  const sesion = leerSesion();
  const rol = rolDeSesion();
  const nombre = sesion?.nombre_completo || "Cajero";

  const enlaces = [
    { to: "/pos", label: "Ventas", icon: ShoppingCart, visible: true },
    {
      to: "/inventario/catalogo",
      label: "Productos",
      icon: Package,
      visible: ROLES_CATALOGO.includes(rol),
    },
    {
      to: "/inventario/reportes",
      label: "Reportes",
      icon: FileBarChart,
      visible: ROLES_REPORTES.includes(rol),
    },
    {
      to: "/",
      label: "Panel",
      icon: LayoutDashboard,
      visible: ROLES_REPORTES.includes(rol),
    },
  ].filter((enlace) => enlace.visible);

  async function cerrarSesion() {
    try {
      await logout();
    } catch {
      /* la sesión local se limpia igual */
    }
    borrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <header className="pos-topbar">
      <div className="pos-marca">
        <span className="pos-marca-icono" aria-hidden="true">
          <ShoppingCart size={20} strokeWidth={2} />
        </span>
        <div>
          <strong>POS</strong>
          <small>Punto de Venta</small>
        </div>
      </div>

      <nav className="pos-nav">
        {enlaces.map(({ to, label, icon: Icono }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `pos-nav-link${isActive ? " is-activa" : ""}`}
          >
            <Icono size={16} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pos-topbar-derecha">
        <RelojPos />
        <div className="pos-cajero">
          <span className="pos-avatar">{iniciales(nombre)}</span>
          <div>
            <strong>{nombre}</strong>
            <small>
              {sesion?.rol_nombre || "Cajero"}
              {turno ? ` · Caja ${turno.terminal_serie}` : ""}
            </small>
          </div>
        </div>
        <button
          type="button"
          className="pos-btn-borde"
          onClick={onCerrarTurno}
          disabled={!turno}
          title={turno ? "Cerrar turno de caja" : "No tienes un turno abierto"}
        >
          <LockKeyhole size={16} strokeWidth={1.75} />
          Cerrar turno
        </button>
        <button
          type="button"
          className="pos-btn-icono"
          onClick={cerrarSesion}
          title="Cerrar sesión"
        >
          <LogOut size={18} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}

export default PosTopbar;
