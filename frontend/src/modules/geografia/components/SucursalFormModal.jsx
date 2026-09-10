import { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { createSucursal, fetchCantones, updateSucursal } from "../api/geografiaApi";

const VACIO = {
  nombre: "",
  telefono: "",
  direccion: "",
  fecha_apertura: "",
  provincia: "",
  canton: "",
};

function SucursalFormModal({ show, sucursal, provincias, onClose, onSaved }) {
  const [form, setForm] = useState(VACIO);
  const [cantones, setCantones] = useState([]);
  const [cargandoCantones, setCargandoCantones] = useState(false);
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
            provincia: sucursal.provincia || "",
            canton: sucursal.canton,
          }
        : VACIO,
    );
  }, [show, sucursal]);

  useEffect(() => {
    if (!show || !form.provincia) {
      setCantones([]);
      return;
    }
    let activo = true;
    setCargandoCantones(true);
    fetchCantones({ provincia: form.provincia })
      .then((response) => {
        if (!activo) return;
        setCantones(response.data);
      })
      .catch(() => {
        if (!activo) return;
        setCantones([]);
      })
      .finally(() => {
        if (activo) setCargandoCantones(false);
      });
    return () => {
      activo = false;
    };
  }, [show, form.provincia]);

  const zonaAsignada = useMemo(() => {
    const desdeCanton = cantones.find((item) => item.id_nombre === form.canton);
    if (desdeCanton) {
      return {
        codigo: desdeCanton.zona_codigo,
        nombre: desdeCanton.zona_nombre,
      };
    }
    const desdeProvincia = provincias.find(
      (item) => item.id_nombre === form.provincia,
    );
    if (!desdeProvincia) return null;
    return {
      codigo: desdeProvincia.zona_codigo,
      nombre: desdeProvincia.zona_nombre,
    };
  }, [cantones, form.canton, form.provincia, provincias]);

  function setCampo(campo, valor) {
    setForm((actual) => {
      if (campo === "provincia") {
        return { ...actual, provincia: valor, canton: "" };
      }
      return { ...actual, [campo]: valor };
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!form.canton) {
      setError("Selecciona un cantón.");
      return;
    }
    const payload = {
      nombre: form.nombre,
      telefono: form.telefono,
      direccion: form.direccion,
      fecha_apertura: form.fecha_apertura || null,
      canton: form.canton,
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
          <input
            className="form-control mb-2"
            value={form.nombre}
            required
            maxLength={120}
            onChange={(e) => setCampo("nombre", e.target.value)}
          />
          <label className="form-label">Teléfono</label>
          <input
            className="form-control mb-2"
            value={form.telefono}
            maxLength={32}
            onChange={(e) => setCampo("telefono", e.target.value)}
          />
          <label className="form-label">Dirección física</label>
          <input
            className="form-control mb-2"
            value={form.direccion}
            required
            maxLength={255}
            onChange={(e) => setCampo("direccion", e.target.value)}
          />
          <label className="form-label">Fecha de apertura</label>
          <input
            className="form-control mb-2"
            type="date"
            value={form.fecha_apertura}
            onChange={(e) => setCampo("fecha_apertura", e.target.value)}
          />

          <label className="form-label">Provincia</label>
          <select
            className="form-select mb-2"
            value={form.provincia}
            required
            onChange={(e) => setCampo("provincia", e.target.value)}
          >
            <option value="">Seleccione una provincia</option>
            {provincias.map((item) => (
              <option key={item.id_nombre} value={item.id_nombre}>
                {item.nombre}
              </option>
            ))}
          </select>

          <label className="form-label">Cantón</label>
          <select
            className="form-select mb-2"
            value={form.canton}
            required
            disabled={!form.provincia || cargandoCantones}
            onChange={(e) => setCampo("canton", e.target.value)}
          >
            <option value="">
              {!form.provincia
                ? "Primero elige una provincia"
                : cargandoCantones
                  ? "Cargando cantones..."
                  : "Seleccione un cantón"}
            </option>
            {cantones.map((item) => (
              <option key={item.id_nombre} value={item.id_nombre}>
                {item.nombre}
              </option>
            ))}
          </select>

          {zonaAsignada ? (
            <p className="text-muted small mb-0 geo-zona-aviso">
              Esta sucursal será asignada automáticamente a la{" "}
              <strong>{zonaAsignada.nombre}</strong>.
            </p>
          ) : (
            <p className="text-muted small mb-0">
              La zona de planificación se asigna según la provincia elegida.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-nueva-sucursal">
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default SucursalFormModal;
