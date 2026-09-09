import { Banknote, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { confirmar } from "../../../shared/confirm";
import { logout } from "../../usuarios/api/authApi";
import { borrarSesion } from "../../usuarios/auth/sesion";
import { mensajeApi } from "../../usuarios/rol";
import { cerrarTurno } from "../api/posApi";
import { dinero, numero, redondear } from "../dinero";
import AvisoDescuadre from "./AvisoDescuadre";

const SOLO_MONTO = /[^\d.]/g;

function Fila({ etiqueta, valor, fuerte }) {
  return (
    <div className={`pos-resumen-fila${fuerte ? " is-fuerte" : ""}`}>
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
    </div>
  );
}

async function confirmarDescuadre(diferencia) {
  if (diferencia === 0) return true;
  const tipo = diferencia < 0 ? "Faltante" : "Sobrante";
  return confirmar(
    `Tienes un descuadre de ${tipo} de ${dinero(Math.abs(diferencia))}. ¿Estás seguro de que tu conteo físico es correcto?`,
    {
      titulo: "Descuadre de caja",
      aceptar: "Confirmar cierre",
      variante: "aviso",
    },
  );
}

function CerrarTurnoModal({ show, turno, resumen, onClose, onCerrado }) {
  const navigate = useNavigate();
  const [efectivoContado, setEfectivoContado] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const esperado = numero(resumen?.efectivo_esperado);
  const vacio = efectivoContado === "";
  const diferencia = vacio ? 0 : redondear(numero(efectivoContado) - esperado);

  useEffect(() => {
    if (!show) return;
    setEfectivoContado("");
    setError("");
  }, [show]);

  async function salir() {
    try {
      await logout();
    } catch {
      /* la sesión local se limpia igual */
    }
    borrarSesion();
    navigate("/login", { replace: true });
  }

  async function onSubmit(evento) {
    evento.preventDefault();
    if (vacio) {
      setError("Escribe el efectivo contado en la caja.");
      return;
    }
    if (!(await confirmarDescuadre(diferencia))) return;
    setGuardando(true);
    try {
      const { data } = await cerrarTurno(turno.id_turno, {
        monto_cierre_real: efectivoContado,
      });
      onCerrado(data);
      await salir();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo cerrar el turno."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="pos-modal">
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="pos-modal-titulo">
            <LockKeyhole size={18} strokeWidth={2} />
            Cerrar turno de caja
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="pos-error">{error}</p> : null}
          <div className="pos-resumen">
            <Fila etiqueta="Caja" valor={turno?.terminal_serie || "—"} />
            <Fila etiqueta="Ventas del turno" valor={resumen?.ventas ?? 0} />
            <Fila etiqueta="Total vendido" valor={dinero(resumen?.total_vendido)} />
            <Fila etiqueta="Apertura" valor={dinero(turno?.monto_apertura)} />
            <Fila
              etiqueta="Efectivo esperado"
              valor={dinero(resumen?.efectivo_esperado)}
              fuerte
            />
          </div>
          <label className="pos-campo mt-3">
            <span className="pos-etiqueta">
              <Banknote size={15} strokeWidth={1.75} />
              Efectivo contado
            </span>
            <input
              className="form-control"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              autoFocus
              value={efectivoContado}
              onChange={(evento) =>
                setEfectivoContado(
                  evento.target.value.replace(SOLO_MONTO, "").slice(0, 9)
                )
              }
            />
            {Number(efectivoContado) < 0 ? (
              <small className="pos-campo-error">El efectivo contado no puede ser negativo.</small>
            ) : null}
            <AvisoDescuadre vacio={vacio} diferencia={diferencia} />
          </label>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="pos-btn-borde" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="pos-btn-negro"
            disabled={guardando || vacio || Number(efectivoContado) < 0}
          >
            {guardando ? "Cerrando..." : "Cerrar turno"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default CerrarTurnoModal;
