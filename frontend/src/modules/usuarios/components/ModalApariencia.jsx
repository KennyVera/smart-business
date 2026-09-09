import { useState } from "react";
import { Modal } from "react-bootstrap";
import { usePreferences } from "../../../context/PreferencesContext";
import { mensajeApi } from "../rol";
import "./modal-apariencia.css";

const FILAS = [10, 25, 50, 100];

function ModalApariencia({ show, onClose }) {
  const {
    colorSidebar,
    colorGraficos,
    colorLogs,
    logoPersonalizado,
    filasPorPagina,
    updatePreferences,
  } = usePreferences();
  const [sidebar, setSidebar] = useState(colorSidebar);
  const [graficos, setGraficos] = useState(colorGraficos);
  const [logs, setLogs] = useState(colorLogs);
  const [filas, setFilas] = useState(filasPorPagina);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(logoPersonalizado || "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function alAbrir() {
    setSidebar(colorSidebar);
    setGraficos(colorGraficos);
    setLogs(colorLogs);
    setFilas(filasPorPagina);
    setLogo(null);
    setPreview(logoPersonalizado || "");
    setError("");
  }

  function alElegirLogo(archivo) {
    setLogo(archivo);
    setPreview(archivo ? URL.createObjectURL(archivo) : logoPersonalizado || "");
  }

  async function onSubmit(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    try {
      await updatePreferences({
        color_sidebar: sidebar,
        color_graficos: graficos,
        color_logs: logs,
        filas_por_pagina: Number(filas),
        ...(logo instanceof File ? { logo_personalizado: logo } : {}),
      });
      onClose();
    } catch (err) {
      setError(mensajeApi(err, "No se pudieron guardar las preferencias."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered onEnter={alAbrir}>
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Apariencia y configuración</Modal.Title>
        </Modal.Header>
        <Modal.Body className="upd-apariencia">
          {error ? <p className="text-danger">{error}</p> : null}
          <label className="form-label">Color del menú</label>
          <input
            type="color"
            className="form-control form-control-color mb-3"
            value={sidebar}
            onChange={(e) => setSidebar(e.target.value)}
          />
          <label className="form-label">Color de gráficos</label>
          <input
            type="color"
            className="form-control form-control-color mb-3"
            value={graficos}
            onChange={(e) => setGraficos(e.target.value)}
          />
          <label className="form-label">Color de los logs</label>
          <input
            type="color"
            className="form-control form-control-color mb-3"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
          />
          <small className="text-muted d-block mb-3">
            Confirmaciones y avisos del sistema (aparte de los gráficos).
          </small>
          <label className="form-label">Logo personalizado</label>
          {preview ? (
            <img src={preview} alt="" className="upd-logo-preview mb-2" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            className="form-control mb-3"
            onChange={(e) => alElegirLogo(e.target.files?.[0] || null)}
          />
          <label className="form-label">Registros por página</label>
          <select
            className="form-select"
            value={filas}
            onChange={(e) => setFilas(Number(e.target.value))}
          >
            {FILAS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-success" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalApariencia;
