import {
  FileBarChart,
  LayoutDashboard,
  LockKeyhole,
  Package,
  ShoppingCart,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { rolDeSesion } from "../../usuarios/auth/sesion";
import UserProfileDropdown from "../../usuarios/components/UserProfileDropdown";
import RelojPos from "./RelojPos";

const ROLES_CATALOGO = ["administrador", "bodeguero"];
const ROLES_REPORTES = ["administrador", "gerente"];
const ROLES_PANEL = ["administrador", "gerente"];

function PosTopbar({ turno, onCerrarTurno }) {
  const rol = rolDeSesion();
  const extraCaja = turno ? ` · Caja ${turno.terminal_serie}` : "";

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
      to: rol === "gerente" ? "/gerente" : "/",
      label: "Panel",
      icon: LayoutDashboard,
      visible: ROLES_PANEL.includes(rol),
    },
  ].filter((enlace) => enlace.visible);

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
        <UserProfileDropdown variant="pos" extraRol={extraCaja} />
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
      </div>
    </header>
  );
}

export default PosTopbar;
