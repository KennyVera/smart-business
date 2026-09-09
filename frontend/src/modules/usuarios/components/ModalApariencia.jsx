import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { normalizarHex, usePreferences } from "../../../context/PreferencesContext";
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
  const [sidebar, setSidebar] = useState(() => normalizarHex(colorSidebar, "#000000"));
  const [graficos, setGraficos] = useState(() => normalizarHex(colorGraficos, "#00aa5d"));
  const [logs, setLogs] = useState(() => normalizarHex(colorLogs, "#00aa5d"));
  const [filas, setFilas] = useState(filasPorPagina);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(logoPersonalizado || "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!show) return;
    setSidebar(normalizarHex(colorSidebar, "#000000"));
    setGraficos(normalizarHex(colorGraficos, "#00aa5d"));
    setLogs(normalizarHex(colorLogs, "#00aa5d"));
    setFilas(filasPorPagina);
    setLogo(null);
    setPreview(logoPersonalizado || "");
    setError("");
  }, [show, colorSidebar, colorGraficos, colorLogs, filasPorPagina, logoPersonalizado]);

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
        color_sidebar: normalizarHex(sidebar, "#000000"),
        color_graficos: normalizarHex(graficos, "#00aa5d"),
        color_logs: normalizarHex(logs, "#00aa5d"),
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
    <Modal show={show} onHide={onClose} centered>
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
            onChange={(e) => setSidebar(normalizarHex(e.target.value, "#000000"))}
          />
          <label className="form-label">Color de gráficos</label>
          <input
            type="color"
            className="form-control form-control-color mb-3"
            value={graficos}
            onChange={(e) => setGraficos(normalizarHex(e.target.value, "#00aa5d"))}
          />
          <label className="form-label">Color de los logs</label>
          <input
            type="color"
            className="form-control form-control-color mb-3"
            value={logs}
            onChange={(e) => setLogs(normalizarHex(e.target.value, "#00aa5d"))}
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
