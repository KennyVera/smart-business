import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  LayoutDashboard,
  MapPinned,
  Menu,
  Package,
  Store,
  Tags,
  Users,
} from "lucide-react";

import { rolDeSesion } from "../../usuarios/auth/sesion";
import SidebarLogout from "./SidebarLogout";

const ADMIN = ["administrador"];
const INVENTARIO = ["administrador", "gerente", "bodeguero"];

const ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, roles: ADMIN },
  { to: "/geografia/zonas", label: "Zonas", icon: MapPinned, roles: ADMIN },
  { to: "/geografia/sucursales", label: "Sucursales", icon: Store, roles: ADMIN },
  { to: "/usuarios", label: "Usuarios", icon: Users, roles: ADMIN },
  { to: "/inventario/catalogo", label: "Catálogo", icon: Package, roles: INVENTARIO },
  { to: "/inventario/categorias", label: "Categorías", icon: Tags, roles: INVENTARIO },
  { to: "/inventario/stock", label: "Stock", icon: Boxes, roles: INVENTARIO },
  { to: "/inventario/alertas", label: "Alertas", icon: AlertTriangle, roles: INVENTARIO },
];

function Sidebar() {
  const [abierto, setAbierto] = useState(false);
  const visibles = useMemo(() => {
    const rol = rolDeSesion();
    return ITEMS.filter((item) => item.roles.includes(rol));
  }, []);

  return (
    <aside className={`admin-sidebar${abierto ? " is-open" : ""}`}>
      <button
        type="button"
        className="sidebar-menu-btn"
        aria-label={abierto ? "Contraer menú" : "Expandir menú"}
        aria-expanded={abierto}
        onClick={() => setAbierto((actual) => !actual)}
      >
        <Menu size={20} />
      </button>
      <nav className="sidebar-nav">
        {visibles.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " is-active" : ""}`
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <SidebarLogout />
    </aside>
  );
}

export default Sidebar;
