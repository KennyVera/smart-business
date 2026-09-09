import { Banknote, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { logout } from "../../usuarios/api/authApi";
import { borrarSesion } from "../../usuarios/auth/sesion";
import { mensajeApi } from "../../usuarios/rol";
import { cerrarTurno } from "../api/posApi";
import { dinero } from "../dinero";

const SOLO_MONTO = /[^\d.]/g;

function Fila({ etiqueta, valor, fuerte }) {
  return (
    <div className={`pos-resumen-fila${fuerte ? " is-fuerte" : ""}`}>
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function CerrarTurnoModal({ show, turno, resumen, onClose, onCerrado }) {
  const navigate = useNavigate();
  const [monto, setMonto] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cerrado, setCerrado] = useState(null);

  useEffect(() => {
    if (!show) return;
    setMonto("");
    setError("");
    setCerrado(null);
  }, [show]);

  async function onSubmit(evento) {
    evento.preventDefault();
    if (monto === "") {
      setError("Escribe el efectivo contado en la caja.");
      return;
    }
    setGuardando(true);
    try {
      const { data } = await cerrarTurno({ monto_cierre_declarado: monto });
      setCerrado(data);
      onCerrado(data);
    } catch (err) {
      setError(mensajeApi(err, "No se pudo cerrar el turno."));
    } finally {
      setGuardando(false);
    }
  }

  async function salir() {
    try {
      await logout();
    } catch {
      /* la sesión local se limpia igual */
    }
    borrarSesion();
    navigate("/login", { replace: true });
  }

  const caja = cerrado?.turno || turno;
  const cifras = cerrado?.resumen || resumen;
  const diferencia = cifras?.diferencia ?? 0;

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="pos-modal">
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="pos-modal-titulo">
            <LockKeyhole size={18} strokeWidth={2} />
            {cerrado ? "Turno cerrado" : "Cerrar turno de caja"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="pos-error">{error}</p> : null}
          <div className="pos-resumen">
            <Fila etiqueta="Caja" valor={caja?.terminal_serie || "—"} />
            <Fila etiqueta="Ventas del turno" valor={cifras?.ventas ?? 0} />
            <Fila etiqueta="Total vendido" valor={dinero(cifras?.total_vendido)} />
            <Fila etiqueta="Apertura" valor={dinero(caja?.monto_apertura)} />
            <Fila
              etiqueta="Efectivo esperado"
              valor={dinero(cifras?.efectivo_esperado)}
              fuerte
            />
          </div>

          {cerrado ? (
            <div className="pos-resumen mt-3">
              <Fila
                etiqueta="Efectivo declarado"
                valor={dinero(caja?.monto_cierre_declarado)}
              />
              <Fila
                etiqueta={diferencia < 0 ? "Faltante en caja" : "Sobrante en caja"}
                valor={dinero(Math.abs(diferencia))}
                fuerte
              />
            </div>
          ) : (
            <label className="pos-campo mt-3">
              <span className="pos-etiqueta">
                <Banknote size={15} strokeWidth={1.75} />
                Efectivo contado
              </span>
              <input
                className="form-control"
                inputMode="decimal"
                autoFocus
                value={monto}
                onChange={(evento) =>
                  setMonto(evento.target.value.replace(SOLO_MONTO, "").slice(0, 9))
                }
              />
            </label>
          )}
        </Modal.Body>
        <Modal.Footer>
          {cerrado ? (
            <>
              <button type="button" className="pos-btn-borde" onClick={onClose}>
                Seguir en el POS
              </button>
              <button type="button" className="pos-btn-negro" onClick={salir}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button type="button" className="pos-btn-borde" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="pos-btn-negro" disabled={guardando}>
                {guardando ? "Cerrando..." : "Cerrar turno"}
              </button>
            </>
          )}
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default CerrarTurnoModal;
