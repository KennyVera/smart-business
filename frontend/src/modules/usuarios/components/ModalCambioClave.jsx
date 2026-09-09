import { useState } from "react";
import { Modal } from "react-bootstrap";
import { mensajeApi } from "../rol";
import { cambiarMiClave } from "../api/perfilApi";

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
    if (nueva !== confirmacion) {
      setError("La nueva clave y la confirmación no coinciden.");
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
          <input
            type="password"
            className="form-control mb-2"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            required
            autoComplete="current-password"
          />
          <label className="form-label">Nueva clave</label>
          <input
            type="password"
            className="form-control mb-2"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
            autoComplete="new-password"
          />
          <label className="form-label">Confirmar nueva clave</label>
          <input
            type="password"
            className="form-control"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
            autoComplete="new-password"
          />
          <small className="text-muted d-block mt-2">
            Mínimo 8 caracteres, con al menos una letra y un número.
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
