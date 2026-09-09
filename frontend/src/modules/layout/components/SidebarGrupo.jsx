import { ChevronDown } from "lucide-react";
import { Collapse } from "react-bootstrap";
import { NavLink } from "react-router-dom";

function SidebarGrupo({
  titulo,
  items,
  expandido,
  sidebarAbierto,
  onToggle,
}) {
  const mostrar = !sidebarAbierto || expandido;

  return (
    <div className="sidebar-grupo">
      <button
        type="button"
        className={`sidebar-grupo-titulo${expandido ? " is-open" : ""}`}
        onClick={onToggle}
        aria-expanded={mostrar}
      >
        <span>{titulo}</span>
        <ChevronDown size={14} strokeWidth={2} className="sidebar-chevron" />
      </button>
      <Collapse in={mostrar}>
        <div className="sidebar-grupo-items">
          {items.map(({ to, label, icon: Icon, end }) => (
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
        </div>
      </Collapse>
    </div>
  );
}

export default SidebarGrupo;
