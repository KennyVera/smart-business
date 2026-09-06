import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createCategoria, updateCategoria } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { LIMITES, filtrarCampo } from "../validacion";
import InventarioCampo from "./InventarioCampo";

function CategoriaFormModal({ show, categoria, onClose, onSaved }) {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const editando = Boolean(categoria);

  useEffect(() => {
    if (!show) return;
    setError("");
    setNombre(categoria?.nombre || "");
  }, [show, categoria]);

  async function onSubmit(event) {
    event.preventDefault();
    if (nombre.trim().length < 3) {
      setError("La categoría necesita al menos 3 caracteres.");
      return;
    }
    try {
      if (editando) {
        await updateCategoria(categoria.id_categoria, { nombre: nombre.trim() });
      } else {
        await createCategoria({ nombre: nombre.trim() });
      }
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo guardar la categoría."));
    }
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="inv-glass-backdrop"
      dialogClassName="inv-form-dialog"
    >
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="inv-form-title">
            <Layers size={18} />
            {editando ? "Editar categoría" : "Nueva categoría"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <InventarioCampo icon={Layers} label="Nombre de la categoría">
            <input
              className="form-control"
              value={nombre}
              maxLength={LIMITES.categoria}
              minLength={3}
              placeholder="Lácteos"
              onChange={(event) => setNombre(filtrarCampo("nombre", event.target.value))}
            />
          </InventarioCampo>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-inv">
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default CategoriaFormModal;
