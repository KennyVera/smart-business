import { useState } from "react";
import { Modal } from "react-bootstrap";
import { mensajeApi } from "../rol";
import { cambiarMiClave } from "../api/perfilApi";
import { LIMITES, MSG_CLAVE, validarCambioClave } from "../validacion";
import CampoClave from "./CampoClave";

function ModalCambioClave({ show, onClose }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [guardando, setGuardando] = useState(false);

  function reiniciar() {
    setActual("");
    setNueva("");
    setConfirmacion("");
    setError("");
    setOk("");
  }

  async function onSubmit(evento) {
    evento.preventDefault();
    setError("");
    setOk("");
    const fallo = validarCambioClave({ actual, nueva, confirmacion });
    if (fallo) {
      setError(fallo);
      return;
    }
    setGuardando(true);
    try {
      await cambiarMiClave({ old_password: actual, new_password: nueva });
      setOk("Clave actualizada correctamente.");
      setActual("");
      setNueva("");
      setConfirmacion("");
    } catch (err) {
      setError(mensajeApi(err, "No se pudo cambiar la clave."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      onEnter={reiniciar}
      onExited={reiniciar}
    >
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Cambio de clave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          {ok ? <p className="text-success">{ok}</p> : null}
          <label className="form-label">Clave actual</label>
          <CampoClave
            wrapperClassName="mb-2"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            required
            minLength={1}
            autoComplete="current-password"
          />
          <label className="form-label">Nueva clave</label>
          <CampoClave
            wrapperClassName="mb-2"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
            autoComplete="new-password"
          />
          <label className="form-label">Confirmar nueva clave</label>
          <CampoClave
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
            autoComplete="new-password"
          />
          <small className="text-muted d-block mt-2">
            {MSG_CLAVE} Máximo {LIMITES.clave} caracteres.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button type="submit" className="btn btn-success" disabled={guardando}>
            {guardando ? "Guardando…" : "Actualizar clave"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalCambioClave;
