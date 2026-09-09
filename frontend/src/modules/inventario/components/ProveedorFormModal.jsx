import {
  AtSign,
  MapPin,
  Pencil,
  Phone,
  Truck,
  UserRound,
  Building2,
  Hash,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createProveedor, fetchProveedores, updateProveedor } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { leerPagina, TODOS } from "../../../shared/paginado";
import { generarRucUnico, generarTelefonoUnico } from "../proveedorDatos";
import { LIMITES, filtrarCampo, validarProveedor } from "../validacion";
import InventarioCampo from "./InventarioCampo";

const VACIO = {
  ruc: "",
  razon_social: "",
  nombre_contacto: "",
  telefono: "",
  email: "",
  direccion: "",
};

function Contador({ valor, max }) {
  const usados = (valor || "").length;
  return (
    <span className="inv-field-contador">
      {usados}/{max}
    </span>
  );
}

function CampoConContador({ icon, label, ayuda, valor, max, children }) {
  return (
    <InventarioCampo
      icon={icon}
      label={
        <>
          {label}
          <Contador valor={valor} max={max} />
        </>
      }
      ayuda={ayuda}
    >
      {children}
    </InventarioCampo>
  );
}

function BotonGenerar({ title, disabled, onClick }) {
  return (
    <button
      type="button"
      className="btn btn-outline-secondary inv-sku-generar"
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      <Sparkles size={15} strokeWidth={1.75} />
      {disabled ? "…" : "Generar"}
    </button>
  );
}

function ProveedorFormModal({ show, proveedor, onClose, onSaved }) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const [generando, setGenerando] = useState({ ruc: false, telefono: false });
  const editando = Boolean(proveedor);

  useEffect(() => {
    if (!show) return;
    setError("");
    setGenerando({ ruc: false, telefono: false });
    setForm(
      proveedor
        ? {
            ruc: proveedor.ruc || "",
            razon_social: proveedor.razon_social || "",
            nombre_contacto: proveedor.nombre_contacto || "",
            telefono: proveedor.telefono || "",
            email: proveedor.email || "",
            direccion: proveedor.direccion || "",
          }
        : VACIO,
    );
  }, [show, proveedor]);

  function onCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: filtrarCampo(campo, valor) }));
  }

  async function cargarUsados() {
    const { data } = await fetchProveedores({ page_size: TODOS });
    const items = leerPagina(data).items;
    const rucs = new Set(items.map((item) => String(item.ruc || "")));
    const telefonos = new Set(items.map((item) => String(item.telefono || "")));
    if (editando && proveedor) {
      if (proveedor.ruc) rucs.delete(String(proveedor.ruc));
      if (proveedor.telefono) telefonos.delete(String(proveedor.telefono));
    }
    return { rucs, telefonos };
  }

  async function onGenerarRuc() {
    setGenerando((actual) => ({ ...actual, ruc: true }));
    setError("");
    try {
      const { rucs } = await cargarUsados();
      onCampo("ruc", generarRucUnico(rucs));
    } catch {
      onCampo("ruc", generarRucUnico());
    } finally {
      setGenerando((actual) => ({ ...actual, ruc: false }));
    }
  }

  async function onGenerarTelefono() {
    setGenerando((actual) => ({ ...actual, telefono: true }));
    setError("");
    try {
      const { telefonos } = await cargarUsados();
      onCampo("telefono", generarTelefonoUnico(telefonos));
    } catch {
      onCampo("telefono", generarTelefonoUnico());
    } finally {
      setGenerando((actual) => ({ ...actual, telefono: false }));
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    const aviso = validarProveedor(form);
    if (aviso) {
      setError(aviso);
      return;
    }
    const payload = {
      ruc: form.ruc.trim(),
      razon_social: form.razon_social.trim(),
      nombre_contacto: form.nombre_contacto.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim().toLowerCase(),
      direccion: form.direccion.trim(),
    };
    try {
      if (editando) {
        await updateProveedor(proveedor.id_proveedor, payload);
      } else {
        await createProveedor(payload);
      }
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo guardar el proveedor."));
    }
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      backdropClassName="inv-glass-backdrop"
      dialogClassName="inv-form-dialog inv-form-dialog--wide"
    >
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="inv-form-title">
            {editando ? <Pencil size={18} /> : <Truck size={18} />}
            {editando ? "Editar proveedor" : "Nuevo proveedor"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger mb-2">{error}</p> : null}

          <div className="inv-form-grid">
            <CampoConContador
              icon={Hash}
              label="RUC"
              ayuda="Solo números. Exactamente 13 dígitos. Usa Generar para uno único."
              valor={form.ruc}
              max={LIMITES.ruc}
            >
              <div className="inv-sku-row">
                <input
                  className="form-control"
                  value={form.ruc}
                  maxLength={LIMITES.ruc}
                  inputMode="numeric"
                  pattern="\d{13}"
                  placeholder="1790012345001"
                  onChange={(e) => onCampo("ruc", e.target.value)}
                  required
                />
                <BotonGenerar
                  title="Generar RUC único"
                  disabled={generando.ruc}
                  onClick={onGenerarRuc}
                />
              </div>
            </CampoConContador>

            <CampoConContador
              icon={Building2}
              label="Razón social"
              ayuda={`Entre 3 y ${LIMITES.razon_social} caracteres.`}
              valor={form.razon_social}
              max={LIMITES.razon_social}
            >
              <input
                className="form-control"
                value={form.razon_social}
                maxLength={LIMITES.razon_social}
                minLength={3}
                onChange={(e) => onCampo("razon_social", e.target.value)}
                required
              />
            </CampoConContador>

            <CampoConContador
              icon={UserRound}
              label="Nombre de contacto"
              ayuda="Solo letras, espacios y guiones (3–100)."
              valor={form.nombre_contacto}
              max={LIMITES.contacto}
            >
              <input
                className="form-control"
                value={form.nombre_contacto}
                maxLength={LIMITES.contacto}
                minLength={3}
                onChange={(e) => onCampo("nombre_contacto", e.target.value)}
                required
              />
            </CampoConContador>

            <CampoConContador
              icon={Phone}
              label="Teléfono"
              ayuda="Celular ecuatoriano (10 dígitos). Usa Generar para uno disponible."
              valor={form.telefono}
              max={LIMITES.telefono}
            >
              <div className="inv-sku-row">
                <input
                  className="form-control"
                  value={form.telefono}
                  maxLength={LIMITES.telefono}
                  inputMode="numeric"
                  pattern="\d{10}"
                  placeholder="0987654321"
                  onChange={(e) => onCampo("telefono", e.target.value)}
                  required
                />
                <BotonGenerar
                  title="Generar teléfono"
                  disabled={generando.telefono}
                  onClick={onGenerarTelefono}
                />
              </div>
            </CampoConContador>

            <CampoConContador
              icon={AtSign}
              label="Correo"
              ayuda={`Máximo ${LIMITES.email} caracteres.`}
              valor={form.email}
              max={LIMITES.email}
            >
              <input
                className="form-control"
                type="email"
                value={form.email}
                maxLength={LIMITES.email}
                onChange={(e) => onCampo("email", e.target.value)}
                required
              />
            </CampoConContador>

            <CampoConContador
              icon={MapPin}
              label="Dirección"
              ayuda={`Entre 5 y ${LIMITES.direccion} caracteres.`}
              valor={form.direccion}
              max={LIMITES.direccion}
            >
              <textarea
                className="form-control inv-field-textarea"
                rows={2}
                value={form.direccion}
                maxLength={LIMITES.direccion}
                minLength={5}
                onChange={(e) => onCampo("direccion", e.target.value)}
                required
              />
            </CampoConContador>
          </div>
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

export default ProveedorFormModal;
