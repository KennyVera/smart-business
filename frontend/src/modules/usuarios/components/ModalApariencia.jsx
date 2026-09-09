import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { normalizarHex, usePreferences } from "../../../context/PreferencesContext";
import { mensajeApi } from "../rol";
import "./modal-apariencia.css";

const FILAS = [10, 25, 50, 100];

function CampoColor({ label, value, onChange, defecto }) {
  const seguro = /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toLowerCase() : defecto;
  return (
    <div className="upd-color-campo mb-3">
      <label className="form-label">{label}</label>
      <div className="upd-color-fila">
        <input
          type="color"
          className="form-control form-control-color"
          value={seguro}
          onChange={(e) => onChange(normalizarHex(e.target.value, defecto))}
          onInput={(e) => onChange(normalizarHex(e.target.value, defecto))}
        />
        <input
          type="text"
          className="form-control upd-color-hex"
          value={value}
          maxLength={7}
          spellCheck={false}
          aria-label={`${label} (hex)`}
          onChange={(e) => {
            let crudo = e.target.value.trim();
            if (!crudo.startsWith("#")) crudo = `#${crudo}`;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(crudo)) {
              onChange(crudo.length === 7 ? crudo.toLowerCase() : crudo);
            }
          }}
          onBlur={() => onChange(normalizarHex(value, defecto))}
        />
      </div>
    </div>
  );
}

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

  // Solo reseedar al abrir el modal (no al actualizar prefs mid-edit / post-save).
  useEffect(() => {
    if (!show) return;
    setSidebar(normalizarHex(colorSidebar, "#000000"));
    setGraficos(normalizarHex(colorGraficos, "#00aa5d"));
    setLogs(normalizarHex(colorLogs, "#00aa5d"));
    setFilas(filasPorPagina);
    setLogo(null);
    setPreview(logoPersonalizado || "");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [show]);

  function alElegirLogo(archivo) {
    setLogo(archivo);
    setPreview(archivo ? URL.createObjectURL(archivo) : logoPersonalizado || "");
  }

  async function onSubmit(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    const colorSidebarOk = normalizarHex(sidebar, "#000000");
    const colorGraficosOk = normalizarHex(graficos, "#00aa5d");
    const colorLogsOk = normalizarHex(logs, "#00aa5d");
    try {
      await updatePreferences({
        color_sidebar: colorSidebarOk,
        color_graficos: colorGraficosOk,
        color_logs: colorLogsOk,
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

          <CampoColor
            label="Color del menú"
            value={sidebar}
            defecto="#000000"
            onChange={setSidebar}
          />
          <CampoColor
            label="Color de gráficos"
            value={graficos}
            defecto="#00aa5d"
            onChange={setGraficos}
          />
          <CampoColor
            label="Color de los logs"
            value={logs}
            defecto="#00aa5d"
            onChange={setLogs}
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
