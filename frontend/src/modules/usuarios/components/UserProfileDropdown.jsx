import { Lock, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";
import { fetchMiPerfil } from "../api/perfilApi";
import { borrarSesion, leerSesion } from "../auth/sesion";
import AvatarPerfil from "./AvatarPerfil";
import ModalCambioClave from "./ModalCambioClave";
import ModalPerfil from "./ModalPerfil";
import "./user-profile-dropdown.css";

function UserProfileDropdown({ variant = "admin", extraRol = "" }) {
  const navigate = useNavigate();
  const sesion = leerSesion();
  const [perfil, setPerfil] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalClave, setModalClave] = useState(false);

  const nombre =
    perfil?.nombre_completo || sesion?.nombre_completo || "Usuario";
  const rol = perfil?.rol_nombre || sesion?.rol_nombre || "";
  const correo = perfil?.correo || sesion?.correo || sesion?.email || "";
  const foto = perfil?.foto_perfil || sesion?.foto_perfil || "";
  const etiquetaRol = extraRol ? `${rol}${extraRol}` : rol;

  useEffect(() => {
    let vivo = true;
    fetchMiPerfil()
      .then(({ data }) => {
        if (vivo) setPerfil(data);
      })
      .catch(() => {
        if (vivo) setPerfil(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function cerrarSesion() {
    try {
      await logout();
    } catch {
      /* limpia igual */
    }
    borrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <Dropdown
        align="end"
        show={menuAbierto}
        onToggle={setMenuAbierto}
        className={`upd-dropdown upd-${variant}`}
      >
        <Dropdown.Toggle as="button" type="button" className="upd-trigger">
          <div className="upd-meta">
            <strong>{nombre}</strong>
            <small>{etiquetaRol}</small>
          </div>
          <AvatarPerfil nombre={nombre} foto={foto} size="md" />
        </Dropdown.Toggle>
        <Dropdown.Menu className="upd-menu shadow">
          <div className="upd-cabecera">
            <AvatarPerfil nombre={nombre} foto={foto} size="lg" />
            <div className="upd-cabecera-texto">
              <strong>{nombre}</strong>
              <small>{correo || sesion?.username || "Sin correo"}</small>
            </div>
          </div>
          <div className="upd-acciones">
            <button
              type="button"
              className="upd-item"
              onClick={() => {
                setMenuAbierto(false);
                setModalPerfil(true);
              }}
            >
              <User size={16} strokeWidth={1.75} />
              Mi perfil
            </button>
            <button
              type="button"
              className="upd-item"
              onClick={() => {
                setMenuAbierto(false);
                setModalClave(true);
              }}
            >
              <Lock size={16} strokeWidth={1.75} />
              Cambio de clave
            </button>
            <hr className="dropdown-divider" />
            <button
              type="button"
              className="upd-item text-danger"
              onClick={cerrarSesion}
            >
              <LogOut size={16} strokeWidth={1.75} />
              Cerrar sesión
            </button>
          </div>
        </Dropdown.Menu>
      </Dropdown>
      <ModalPerfil
        show={modalPerfil}
        perfil={perfil || sesion}
        onClose={() => setModalPerfil(false)}
        onGuardado={setPerfil}
      />
      <ModalCambioClave show={modalClave} onClose={() => setModalClave(false)} />
    </>
  );
}

export default UserProfileDropdown;
