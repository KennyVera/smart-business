import { useEffect, useState } from "react";
import { desactivarUsuario, fetchRoles, fetchSucursalesAsignables, restablecerClave } from "../api/usuariosApi";
import { leerSesion } from "../auth/sesion";
import { mensajeApi } from "../rol";
import { useUsuarios } from "../hooks/useUsuarios";
import UsuarioClaveModal from "../components/UsuarioClaveModal";
import UsuarioFormModal from "../components/UsuarioFormModal";
import HistorialSesionesOffcanvas from "../components/HistorialSesionesOffcanvas";
import UsuariosHeader from "../components/UsuariosHeader";
import UsuariosTable from "../components/UsuariosTable";
import "../usuarios.css";
import "../usuarios-acciones.css";
import "../usuarios-form.css";
import "../sesiones.css";

function UsuariosPage() {
  const { items, error, cargando, recargar } = useUsuarios();
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState({ open: false, usuario: null });
  const [clave, setClave] = useState({ open: false, username: "", valor: "" });
  const [historial, setHistorial] = useState({ open: false, usuario: null });
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    fetchRoles().then((response) => setRoles(response.data)).catch(() => setRoles([]));
    fetchSucursalesAsignables()
      .then((response) => setSucursales(response.data))
      .catch(() => setSucursales([]));
  }, []);

  async function onDesactivar(usuario) {
    const sesion = leerSesion();
    if (sesion?.id_usuario === usuario.id_usuario) {
      setAviso("No puedes suspender tu propia sesión.");
      return;
    }
    const ok = window.confirm(
      `¿Suspender a "${usuario.username}"? No se borrará el historial de ventas ni los cierres de caja.`,
    );
    if (!ok) return;
    try {
      await desactivarUsuario(usuario.id_usuario);
      setAviso("");
      recargar();
    } catch (err) {
      setAviso(mensajeApi(err, "No se pudo desactivar el usuario."));
    }
  }

  async function onClave(usuario) {
    try {
      const { data } = await restablecerClave(usuario.id_usuario);
      setClave({ open: true, username: data.username, valor: data.clave_temporal });
    } catch (err) {
      setAviso(mensajeApi(err, "No se pudo restablecer la contraseña."));
    }
  }

  return (
    <div className="page-card">
      <UsuariosHeader onNuevo={() => setForm({ open: true, usuario: null })} />
      {cargando ? <p className="text-muted mb-0">Cargando usuarios...</p> : null}
      {error ? <p className="text-danger mb-0">{error}</p> : null}
      {aviso ? <p className="text-danger mb-2">{aviso}</p> : null}
      {!cargando && !error ? (
        <UsuariosTable
          usuarios={items}
          onEditar={(item) => setForm({ open: true, usuario: item })}
          onClave={onClave}
          onDesactivar={onDesactivar}
          onSesiones={(item) => setHistorial({ open: true, usuario: item })}
        />
      ) : null}
      <UsuarioFormModal
        show={form.open}
        usuario={form.usuario}
        roles={roles}
        sucursales={sucursales}
        onClose={() => setForm({ open: false, usuario: null })}
        onSaved={() => {
          setForm({ open: false, usuario: null });
          recargar();
        }}
      />
      <UsuarioClaveModal
        show={clave.open}
        username={clave.username}
        clave={clave.valor}
        onClose={() => setClave({ open: false, username: "", valor: "" })}
      />
      <HistorialSesionesOffcanvas
        show={historial.open}
        usuario={historial.usuario}
        onClose={() => setHistorial({ open: false, usuario: null })}
      />
    </div>
  );
}

export default UsuariosPage;
