import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { mensajeApi } from "../../usuarios/rol";
import { crearCliente } from "../api/posApi";
import {
  filtrarCorreo,
  filtrarNombre,
  hayErrores,
  validarCliente,
} from "../validacionCliente";

const VACIO = { cedula: "", nombres: "", apellidos: "", correo: "" };

function ModalNuevoCliente({ show, cedulaInicial, onClose, onCreado }) {
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [errores, setErrores] = useState(VACIO);
  const [errorApi, setErrorApi] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!show) return;
    setCedula(String(cedulaInicial || "").replace(/\D/g, "").slice(0, 13));
    setNombres("");
    setApellidos("");
    setCorreo("");
    setErrores(VACIO);
    setErrorApi("");
  }, [show, cedulaInicial]);

  async function onSubmit(evento) {
    evento.preventDefault();
    const avisos = validarCliente({ cedula, nombres, apellidos, correo });
    setErrores(avisos);
    setErrorApi("");
    if (hayErrores(avisos)) return;
    setGuardando(true);
    try {
      const { data } = await crearCliente({
        cedula_ruc: cedula.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim() || null,
      });
      onCreado(data);
    } catch (err) {
      setErrorApi(mensajeApi(err, "No se pudo registrar al cliente."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="pos-modal pos-modal-crm">
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="pos-modal-titulo">
            <UserPlus size={18} strokeWidth={2} />
            Registro Rápido de Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorApi ? <p className="pos-error">{errorApi}</p> : null}
          <label className="pos-campo">
            <span className="pos-etiqueta">Cédula / RUC</span>
            <input
              className={`form-control${errores.cedula ? " is-invalido" : ""}`}
              type="text"
              inputMode="numeric"
              value={cedula}
              readOnly
              aria-readonly="true"
              aria-invalid={Boolean(errores.cedula)}
            />
            {errores.cedula ? <small className="pos-campo-error">{errores.cedula}</small> : null}
          </label>
          <label className="pos-campo">
            <span className="pos-etiqueta">Nombres</span>
            <input
              className={`form-control${errores.nombres ? " is-invalido" : ""}`}
              type="text"
              autoComplete="off"
              maxLength={25}
              value={nombres}
              autoFocus
              placeholder="Nombres"
              aria-invalid={Boolean(errores.nombres)}
              onChange={(evento) => {
                setNombres(filtrarNombre(evento.target.value));
                setErrores((actual) => ({ ...actual, nombres: "" }));
              }}
            />
            {errores.nombres ? (
              <small className="pos-campo-error">{errores.nombres}</small>
            ) : null}
          </label>
          <label className="pos-campo">
            <span className="pos-etiqueta">Apellidos</span>
            <input
              className={`form-control${errores.apellidos ? " is-invalido" : ""}`}
              type="text"
              autoComplete="off"
              maxLength={25}
              value={apellidos}
              placeholder="Apellidos"
              aria-invalid={Boolean(errores.apellidos)}
              onChange={(evento) => {
                setApellidos(filtrarNombre(evento.target.value));
                setErrores((actual) => ({ ...actual, apellidos: "" }));
              }}
            />
            {errores.apellidos ? (
              <small className="pos-campo-error">{errores.apellidos}</small>
            ) : null}
          </label>
          <label className="pos-campo mb-0">
            <span className="pos-etiqueta">Correo electrónico</span>
            <input
              className={`form-control${errores.correo ? " is-invalido" : ""}`}
              type="email"
              autoComplete="off"
              maxLength={25}
              value={correo}
              placeholder="Opcional"
              aria-invalid={Boolean(errores.correo)}
              onChange={(evento) => {
                setCorreo(filtrarCorreo(evento.target.value));
                setErrores((actual) => ({ ...actual, correo: "" }));
              }}
            />
            {errores.correo ? (
              <small className="pos-campo-error">{errores.correo}</small>
            ) : (
              <small className="pos-nota d-block mt-1 mb-0">
                Opcional. Se usa para enviar la factura electrónica.
              </small>
            )}
          </label>
        </Modal.Body>
        <Modal.Footer className="pos-crm-footer">
          <button type="button" className="pos-btn-texto" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="pos-btn-guardar-cliente"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Cliente"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalNuevoCliente;
