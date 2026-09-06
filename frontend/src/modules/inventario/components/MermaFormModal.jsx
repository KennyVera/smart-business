import { Boxes, ClipboardList, PackageMinus } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createMerma } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { LIMITES, filtrarCampo, validarMerma } from "../validacion";
import InventarioCampo from "./InventarioCampo";

const MOTIVOS = [
  "Producto caducado",
  "Envase roto en bodega",
  "Cadena de frío interrumpida",
  "Producto en mal estado",
];

function MermaFormModal({ show, fila, onClose, onSaved }) {
  const [form, setForm] = useState({ cantidad: "", motivo: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;
    setError("");
    setForm({ cantidad: "", motivo: "" });
  }, [show, fila]);

  function onCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: filtrarCampo(campo, valor) }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const aviso = validarMerma(form);
    if (aviso) {
      setError(aviso);
      return;
    }
    if (Number(form.cantidad) > fila.cantidad_actual) {
      setError(`Solo hay ${fila.cantidad_actual} unidades en stock.`);
      return;
    }
    try {
      await createMerma({
        sucursal: fila.id_sucursal,
        producto: fila.id_producto,
        cantidad: Number(form.cantidad),
        motivo: form.motivo.trim(),
      });
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo registrar la merma."));
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
            <PackageMinus size={18} />
            Registrar merma
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <p className="inv-modal-producto">
            {fila?.producto_nombre}
            <small>
              {fila?.sku} · {fila?.cantidad_actual} unidades en stock
            </small>
          </p>
          <InventarioCampo icon={Boxes} label="Unidades a dar de baja">
            <input
              className="form-control"
              value={form.cantidad}
              inputMode="numeric"
              placeholder="0"
              onChange={(event) => onCampo("cantidad", event.target.value)}
            />
          </InventarioCampo>
          <InventarioCampo
            icon={ClipboardList}
            label="Motivo"
            ayuda="Queda registrado con tu usuario y la fecha."
          >
            <input
              className="form-control"
              value={form.motivo}
              maxLength={LIMITES.motivo}
              minLength={5}
              list="inv-motivos"
              placeholder="Se rompió una botella de vidrio"
              onChange={(event) => onCampo("motivo", event.target.value)}
            />
          </InventarioCampo>
          <datalist id="inv-motivos">
            {MOTIVOS.map((motivo) => (
              <option key={motivo} value={motivo} />
            ))}
          </datalist>
          <p className="inv-nota mb-0">
            La baja descuenta el stock y consume primero el lote que vence antes.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-inv btn-inv-peligro">
            Dar de baja
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default MermaFormModal;
