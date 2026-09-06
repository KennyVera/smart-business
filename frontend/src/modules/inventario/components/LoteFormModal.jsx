import { Boxes, CalendarClock, PackagePlus, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createLote } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { LIMITES, filtrarCampo, validarLote } from "../validacion";
import InventarioCampo from "./InventarioCampo";

const VACIO = { producto: "", codigo_lote: "", fecha_vencimiento: "", cantidad: "" };

function LoteFormModal({ show, producto, sucursal, onClose, onSaved }) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;
    setError("");
    setForm({ ...VACIO, producto: producto ? String(producto.id_producto) : "" });
  }, [show, producto]);

  function onCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: filtrarCampo(campo, valor) }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const aviso = validarLote(form);
    if (aviso) {
      setError(aviso);
      return;
    }
    try {
      await createLote({
        producto: Number(form.producto),
        codigo_lote: form.codigo_lote.trim(),
        fecha_vencimiento: form.fecha_vencimiento,
        cantidad: Number(form.cantidad),
        ...(sucursal?.id ? { sucursal: Number(sucursal.id) } : {}),
      });
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo registrar el lote."));
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
            <PackagePlus size={18} />
            Ingresar lote
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <InventarioCampo icon={Tag} label="Producto">
            <input className="form-control" value={producto?.nombre || ""} disabled />
          </InventarioCampo>
          <InventarioCampo
            icon={Boxes}
            label="Código de lote"
            ayuda="El que viene impreso en la caja del proveedor."
          >
            <input
              className="form-control"
              value={form.codigo_lote}
              maxLength={LIMITES.codigo_lote}
              minLength={4}
              placeholder="L-REQ-2201"
              onChange={(event) => onCampo("codigo_lote", event.target.value)}
            />
          </InventarioCampo>
          <div className="row g-2">
            <div className="col-7">
              <InventarioCampo icon={CalendarClock} label="Fecha de vencimiento">
                <input
                  type="date"
                  className="form-control"
                  value={form.fecha_vencimiento}
                  onChange={(event) => onCampo("fecha_vencimiento", event.target.value)}
                />
              </InventarioCampo>
            </div>
            <div className="col-5">
              <InventarioCampo icon={Boxes} label="Unidades">
                <input
                  className="form-control"
                  value={form.cantidad}
                  inputMode="numeric"
                  placeholder="0"
                  onChange={(event) => onCampo("cantidad", event.target.value)}
                />
              </InventarioCampo>
            </div>
          </div>
          <p className="inv-nota mb-0">
            El ingreso suma las unidades al stock de {sucursal?.nombre || "la sucursal"}.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-inv">
            Registrar lote
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default LoteFormModal;
