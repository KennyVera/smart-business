import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { rolDeSesion } from "../../usuarios/auth/sesion";
import { SIDEBAR_MODULOS, grupoContieneRuta } from "../sidebarMenu";
import SidebarGrupo from "./SidebarGrupo";
import SidebarLogout from "./SidebarLogout";

function estadoInicial(modulos, pathname) {
  const abierto = {};
  let hayActivo = false;
  for (const mod of modulos) {
    const activo = grupoContieneRuta(mod.items, pathname);
    abierto[mod.id] = activo;
    if (activo) hayActivo = true;
  }
  if (!hayActivo && modulos[0]) abierto[modulos[0].id] = true;
  return abierto;
}

function Sidebar() {
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const modulos = useMemo(() => {
    const rol = rolDeSesion();
    return SIDEBAR_MODULOS.map((mod) => ({
      ...mod,
      items: mod.items.filter((item) => item.roles.includes(rol)),
    })).filter((mod) => mod.items.length > 0);
  }, []);

  const [gruposAbiertos, setGruposAbiertos] = useState(() =>
    estadoInicial(modulos, pathname),
  );

  useEffect(() => {
    setGruposAbiertos((prev) => {
      const next = { ...prev };
      for (const mod of modulos) {
        if (grupoContieneRuta(mod.items, pathname)) next[mod.id] = true;
      }
      return next;
    });
  }, [pathname, modulos]);

  function alternarGrupo(id) {
    setGruposAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

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
        {modulos.map((mod) => (
          <SidebarGrupo
            key={mod.id}
            titulo={mod.titulo}
            items={mod.items}
            expandido={Boolean(gruposAbiertos[mod.id])}
            sidebarAbierto={abierto}
            onToggle={() => alternarGrupo(mod.id)}
          />
        ))}
      </nav>
      <SidebarLogout />
    </aside>
  );
}

export default Sidebar;
