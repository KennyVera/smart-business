import { Modal } from "react-bootstrap";

function UsuarioClaveModal({ show, username, clave, onClose }) {
  async function copiar() {
    try {
      await navigator.clipboard.writeText(clave);
    } catch {
      /* el administrador puede copiar a mano */
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Clave temporal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-2">
          Contraseña temporal para <strong>{username}</strong>. Entrégasela ahora; no se volverá a mostrar.
        </p>
        <p className="usuario-clave-temporal mb-0">{clave}</p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-light" onClick={copiar}>Copiar</button>
        <button type="button" className="btn-nuevo-usuario" onClick={onClose}>Listo</button>
      </Modal.Footer>
    </Modal>
  );
}

export default UsuarioClaveModal;
