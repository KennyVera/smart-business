import { useState } from "react";
import { Modal } from "react-bootstrap";
import { mensajeApi } from "../rol";
import { actualizarMiPerfil } from "../api/perfilApi";
import { actualizarSesion } from "../auth/sesion";
import FotoPerfilCampo from "./FotoPerfilCampo";

function ModalPerfil({ show, perfil, onClose, onGuardado }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function alAbrir() {
    setNombre(perfil?.nombre || "");
    setApellido(perfil?.apellido || "");
    setCorreo(perfil?.correo || "");
    setFoto(null);
    setPreview(perfil?.foto_perfil || "");
    setError("");
  }

  function alElegirFoto(archivo) {
    setFoto(archivo);
    if (!archivo) {
      setPreview(perfil?.foto_perfil || "");
      return;
    }
    setPreview(URL.createObjectURL(archivo));
  }

  async function onSubmit(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const { data } = await actualizarMiPerfil({
        nombre,
        apellido,
        correo: correo.trim() || null,
        ...(foto instanceof File ? { foto_perfil: foto } : {}),
      });
      actualizarSesion({
        nombre: data.nombre,
        apellido: data.apellido,
        nombre_completo: data.nombre_completo,
        email: data.correo,
        correo: data.correo,
        foto_perfil: data.foto_perfil,
      });
      onGuardado?.(data);
      onClose();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo guardar el perfil."));
    } finally {
      setGuardando(false);
    }
  }

  const nombreVista = `${nombre} ${apellido}`.trim() || "Usuario";

  return (
    <Modal show={show} onHide={onClose} centered onEnter={alAbrir}>
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Mi perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <FotoPerfilCampo
            nombre={nombreVista}
            preview={preview}
            onElegir={alElegirFoto}
          />
          <label className="form-label">Nombre</label>
          <input
            className="form-control mb-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            maxLength={40}
          />
          <label className="form-label">Apellidos</label>
          <input
            className="form-control mb-2"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            maxLength={40}
          />
          <label className="form-label">Correo</label>
          <input
            type="email"
            className="form-control"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            maxLength={100}
            placeholder="opcional"
          />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-success" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalPerfil;
