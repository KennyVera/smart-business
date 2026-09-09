import { Bell } from "lucide-react";
import { Dropdown } from "react-bootstrap";
import { useNotificaciones } from "../hooks/useNotificaciones";
import ItemNotificacion from "./ItemNotificacion";

function NotificacionesBell() {
  const { items, cargando, noLeidas, marcarLeida } = useNotificaciones();
  const visibles = items.slice(0, 8);

  return (
    <Dropdown align="end" className="header-bell-dropdown">
      <Dropdown.Toggle
        as="button"
        type="button"
        className="header-bell"
        aria-label="Notificaciones"
      >
        <Bell size={18} strokeWidth={1.75} />
        {noLeidas > 0 ? (
          <span className="header-badge bg-danger">{noLeidas > 9 ? "9+" : noLeidas}</span>
        ) : null}
      </Dropdown.Toggle>
      <Dropdown.Menu className="header-notif-menu">
        <div className="header-notif-head">Notificaciones</div>
        {cargando ? (
          <div className="header-notif-vacio">Cargando…</div>
        ) : null}
        {!cargando && visibles.length === 0 ? (
          <div className="header-notif-vacio">Sin notificaciones</div>
        ) : null}
        {!cargando
          ? visibles.map((nota) => (
              <ItemNotificacion
                key={nota.id_notificacion}
                nota={nota}
                onLeer={marcarLeida}
              />
            ))
          : null}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificacionesBell;
