import { Banknote, MonitorSmartphone, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { mensajeApi } from "../../usuarios/rol";
import { abrirTurno } from "../api/posApi";

const SOLO_MONTO = /[^\d.]/g;

function AbrirTurnoModal({ show, terminales, onClose, onAbierto }) {
  const [terminal, setTerminal] = useState("");
  const [monto, setMonto] = useState("0.00");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!show) return;
    setError("");
    setMonto("0.00");
    setTerminal(terminales.length ? String(terminales[0].id_terminal) : "");
  }, [show, terminales]);

  async function onSubmit(evento) {
    evento.preventDefault();
    setGuardando(true);
    try {
      const { data } = await abrirTurno({
        terminal: terminal ? Number(terminal) : null,
        monto_apertura: monto === "" ? "0.00" : monto,
      });
      onAbierto(data);
    } catch (err) {
      setError(mensajeApi(err, "No se pudo abrir el turno de caja."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="pos-modal">
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="pos-modal-titulo">
            <Unlock size={18} strokeWidth={2} />
            Abrir turno de caja
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="pos-error">{error}</p> : null}
          {terminales.length === 0 ? (
            <p className="mb-0">
              No hay terminales activas en tu sucursal. Pide al administrador que
              registre una caja antes de vender.
            </p>
          ) : (
            <>
              <label className="pos-campo">
                <span className="pos-etiqueta">
                  <MonitorSmartphone size={15} strokeWidth={1.75} />
                  Terminal
                </span>
                <select
                  className="form-select"
                  value={terminal}
                  onChange={(evento) => setTerminal(evento.target.value)}
                >
                  {terminales.map((item) => (
                    <option key={item.id_terminal} value={item.id_terminal}>
                      {item.numero_serie} · {item.sucursal_nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pos-campo">
                <span className="pos-etiqueta">
                  <Banknote size={15} strokeWidth={1.75} />
                  Monto de apertura
                </span>
                <input
                  className="form-control"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={monto}
                  onChange={(evento) => {
                    const limpio = evento.target.value.replace(SOLO_MONTO, "").slice(0, 9);
                    setMonto(limpio);
                    setError("");
                  }}
                />
                {Number(monto) < 0 ? (
                  <small className="pos-campo-error">El monto no puede ser negativo.</small>
                ) : null}
              </label>
              <p className="pos-nota mb-0">
                Es el efectivo con el que arranca la caja; se usará al cuadrar el
                cierre del turno.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="pos-btn-borde" onClick={onClose}>
            Más tarde
          </button>
          <button
            type="submit"
            className="pos-btn-negro"
            disabled={guardando || terminales.length === 0 || Number(monto) < 0}
          >
            {guardando ? "Abriendo..." : "Abrir turno"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default AbrirTurnoModal;
