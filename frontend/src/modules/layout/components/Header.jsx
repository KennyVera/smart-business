import { Bell, Search } from "lucide-react";
import { iniciales, leerSesion } from "../../usuarios/auth/sesion";

const NOTIFICACIONES = 0;

function Header() {
  const sesion = leerSesion();
  const nombre = sesion?.nombre_completo || "Usuario";
  const rol = sesion?.rol_nombre || "";

  return (
    <header className="admin-header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true" />
        <span className="header-title">Smart Business</span>
      </div>
      <label className="header-search">
        <Search size={16} strokeWidth={1.75} />
        <input type="search" placeholder="Buscar sucursales, zonas o usuarios" />
      </label>
      <div className="header-actions">
        <button type="button" className="header-bell" aria-label="Notificaciones">
          <Bell size={18} strokeWidth={1.75} />
          {NOTIFICACIONES > 0 ? (
            <span className="header-badge">{NOTIFICACIONES}</span>
          ) : null}
        </button>
        <div className="header-user">
          <div>
            <strong>{nombre}</strong>
            <small>{rol}</small>
          </div>
          <span className="header-avatar">{iniciales(nombre)}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
