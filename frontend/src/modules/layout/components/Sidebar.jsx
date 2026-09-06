import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPinned,
  Menu,
  Store,
  Users,
} from "lucide-react";

import SidebarLogout from "./SidebarLogout";

const ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/geografia/zonas", label: "Zonas", icon: MapPinned },
  { to: "/geografia/sucursales", label: "Sucursales", icon: Store },
  { to: "/usuarios", label: "Usuarios", icon: Users },
];

function Sidebar() {
  const [abierto, setAbierto] = useState(false);

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
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
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
