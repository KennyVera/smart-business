import { CheckCircle2 } from "lucide-react";
import { Modal } from "react-bootstrap";
import { dinero } from "../dinero";
import { CONSUMIDOR_FINAL_NOMBRE } from "../impuestos";

function VentaFinalizadaModal({ show, comprobante, onNuevaVenta }) {
  const venta = comprobante?.venta;
  const cliente =
    venta?.cliente_nombre && venta.cliente_nombre !== "Consumidor final"
      ? venta.cliente_nombre
      : CONSUMIDOR_FINAL_NOMBRE;
  const recibido = venta?.monto_recibido ?? comprobante?.monto_recibido ?? comprobante?.total;
  const cambio = venta?.cambio ?? comprobante?.cambio ?? 0;

  return (
    <Modal show={show} onHide={onNuevaVenta} centered dialogClassName="pos-modal">
      <Modal.Body className="pos-exito">
        <span className="pos-exito-icono" aria-hidden="true">
          <CheckCircle2 size={34} strokeWidth={1.75} />
        </span>
        <h3>Venta registrada</h3>
        <p className="pos-exito-folio">
          Ticket #{String(venta?.id_venta || 0).padStart(6, "0")}
        </p>
        <strong className="fw-bold fs-1">{dinero(comprobante?.total)}</strong>
        <div className="pos-resumen mt-3">
          <div className="pos-resumen-fila">
            <span>Método</span>
            <strong>{venta?.metodo_pago || "—"}</strong>
          </div>
          <div className="pos-resumen-fila">
            <span>Cliente</span>
            <strong>{cliente}</strong>
          </div>
          <div className="pos-resumen-fila">
            <span>Recibido</span>
            <strong>{dinero(recibido)}</strong>
          </div>
          <div className="pos-resumen-fila is-fuerte">
            <span>Cambio</span>
            <strong>{dinero(cambio)}</strong>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="pos-btn-finalizar" onClick={onNuevaVenta}>
          Nueva venta
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default VentaFinalizadaModal;
