import { Search } from "lucide-react";
import { usePreferences } from "../../../context/PreferencesContext";
import NotificacionesBell from "./NotificacionesBell";
import UserProfileDropdown from "../../usuarios/components/UserProfileDropdown";

function Header() {
  const { logoPersonalizado } = usePreferences();

  return (
    <header className="admin-header">
      <div className="header-brand">
        {logoPersonalizado ? (
          <img
            src={logoPersonalizado}
            alt="Logo"
            className="header-logo-img"
            height={40}
          />
        ) : (
          <span className="header-logo" aria-hidden="true" />
        )}
        <span className="header-title">Smart Business</span>
      </div>
      <label className="header-search">
        <Search size={16} strokeWidth={1.75} />
        <input type="search" placeholder="Buscar sucursales, zonas o usuarios" />
      </label>
      <div className="header-actions">
        <NotificacionesBell />
        <UserProfileDropdown variant="admin" />
      </div>
    </header>
  );
}

export default Header;
