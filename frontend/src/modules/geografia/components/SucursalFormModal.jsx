import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createSucursal, updateSucursal } from "../api/geografiaApi";

const VACIO = {
  nombre: "",
  telefono: "",
  direccion: "",
  fecha_apertura: "",
  canton: "",
};

function SucursalFormModal({ show, sucursal, cantones, onClose, onSaved }) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const editando = Boolean(sucursal);

  useEffect(() => {
    if (!show) return;
    setError("");
    setForm(
      sucursal
        ? {
            nombre: sucursal.nombre,
            telefono: sucursal.telefono || "",
            direccion: sucursal.direccion || "",
            fecha_apertura: sucursal.fecha_apertura || "",
            canton: sucursal.canton,
          }
        : VACIO,
    );
  }, [show, sucursal]);

  function setCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      fecha_apertura: form.fecha_apertura || null,
    };
    try {
      if (editando) {
        await updateSucursal(sucursal.id_nombre, payload);
      } else {
        await createSucursal(payload);
      }
      onSaved();
    } catch {
      setError("No se pudo guardar la sucursal.");
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar sucursal" : "Nueva sucursal"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <label className="form-label">Nombre</label>
          <input className="form-control mb-2" value={form.nombre} required onChange={(e) => setCampo("nombre", e.target.value)} />
          <label className="form-label">Teléfono</label>
          <input className="form-control mb-2" value={form.telefono} onChange={(e) => setCampo("telefono", e.target.value)} />
          <label className="form-label">Dirección física</label>
          <input className="form-control mb-2" value={form.direccion} required onChange={(e) => setCampo("direccion", e.target.value)} />
          <label className="form-label">Fecha de apertura</label>
          <input className="form-control mb-2" type="date" value={form.fecha_apertura} onChange={(e) => setCampo("fecha_apertura", e.target.value)} />
          <label className="form-label">Cantón / Zona</label>
          <select className="form-select" value={form.canton} required onChange={(e) => setCampo("canton", e.target.value)}>
            <option value="">Seleccione un cantón</option>
            {cantones.map((item) => (
              <option key={item.id_nombre} value={item.id_nombre}>
                {item.nombre} — {item.zona_nombre}
              </option>
            ))}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-nueva-sucursal">Guardar</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default SucursalFormModal;
