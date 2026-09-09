import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createCategoria, updateCategoria } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { LIMITES, filtrarCampo, validarCategoria } from "../validacion";
import InventarioCampo from "./InventarioCampo";

function CategoriaFormModal({ show, categoria, onClose, onSaved }) {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const editando = Boolean(categoria);
  const restantes = LIMITES.categoria - nombre.length;

  useEffect(() => {
    if (!show) return;
    setError("");
    setGuardando(false);
    setNombre(filtrarCampo("categoria", categoria?.nombre || ""));
  }, [show, categoria]);

  async function onSubmit(event) {
    event.preventDefault();
    const aviso = validarCategoria(nombre);
    if (aviso) {
      setError(aviso);
      return;
    }
    setGuardando(true);
    setError("");
    const limpio = nombre.trim().replace(/\s{2,}/g, " ");
    try {
      if (editando) {
        await updateCategoria(categoria.id_categoria, { nombre: limpio });
      } else {
        await createCategoria({ nombre: limpio });
      }
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo guardar la categoría."));
    } finally {
      setGuardando(false);
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
          {error ? <p className="text-danger mb-2">{error}</p> : null}
          <InventarioCampo
            icon={Layers}
            label="Nombre de la categoría"
            ayuda={`3 a ${LIMITES.categoria} caracteres. Debe incluir letras (ej. Lácteos, Bebidas).`}
          >
            <input
              className="form-control"
              value={nombre}
              maxLength={LIMITES.categoria}
              minLength={3}
              required
              autoFocus
              autoComplete="off"
              placeholder="Lácteos"
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                setNombre(filtrarCampo("categoria", event.target.value));
                if (error) setError("");
              }}
            />
          </InventarioCampo>
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">Sin símbolos raros ni solo números.</small>
            <small className={restantes <= 5 ? "text-danger" : "text-muted"}>
              {nombre.length}/{LIMITES.categoria}
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="btn-inv" disabled={guardando || !nombre.trim()}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default CategoriaFormModal;
