import { Boxes, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { ajustarStock } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { filtrarCampo } from "../validacion";
import InventarioCampo from "./InventarioCampo";

function StockAjusteModal({ show, fila, onClose, onSaved }) {
  const [form, setForm] = useState({ cantidad_actual: "", stock_minimo: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show || !fila) return;
    setError("");
    setForm({
      cantidad_actual: String(fila.cantidad_actual),
      stock_minimo: String(fila.stock_minimo),
    });
  }, [show, fila]);

  function onCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: filtrarCampo(campo, valor) }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (form.cantidad_actual === "" || form.stock_minimo === "") {
      setError("Completa las dos cantidades.");
      return;
    }
    const cantidad = Number(form.cantidad_actual);
    const minimo = Number(form.stock_minimo);
    if (!Number.isFinite(cantidad) || cantidad < 0 || !Number.isFinite(minimo) || minimo < 0) {
      setError("Las cantidades no pueden ser negativas.");
      return;
    }
    try {
      await ajustarStock({
        sucursal: fila.id_sucursal,
        producto: fila.id_producto,
        cantidad_actual: cantidad,
        stock_minimo: minimo,
      });
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo ajustar el stock."));
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
            <SlidersHorizontal size={18} />
            Ajustar stock
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <p className="inv-modal-producto">
            {fila?.producto_nombre}
            <small>
              {fila?.sku} · {fila?.sucursal_nombre}
            </small>
          </p>
          <div className="row g-2">
            <div className="col-6">
              <InventarioCampo icon={Boxes} label="Cantidad actual">
                <input
                  className="form-control"
                  value={form.cantidad_actual}
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => onCampo("cantidad_actual", event.target.value)}
                />
              </InventarioCampo>
            </div>
            <div className="col-6">
              <InventarioCampo icon={ShieldAlert} label="Stock mínimo">
                <input
                  className="form-control"
                  value={form.stock_minimo}
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => onCampo("stock_minimo", event.target.value)}
                />
              </InventarioCampo>
            </div>
          </div>
          <p className="inv-nota mb-0">
            El mínimo define cuándo la fila se pinta como alerta en esta pantalla.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-inv">
            Guardar ajuste
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default StockAjusteModal;
