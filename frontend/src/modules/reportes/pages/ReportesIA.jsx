import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileDown,
  Loader2,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { confirmar } from "../../../shared/confirm";
import { TODOS, leerPagina } from "../../../shared/paginado";
import { mensajeApi } from "../../usuarios/rol";
import {
  descargarPdfHistorialReporteIA,
  eliminarHistorialReporteIA,
  fetchHistorialReporteIA,
  fetchHistorialReportesIA,
  generarReporteIA,
} from "../api/reportesApi";
import HistorialSidebar from "../components/HistorialSidebar";
import ReporteIAChart from "../components/ReporteIAChart";
import { MSG_SOLO_SISTEMA, esFueraDeAmbito } from "../ambito";
import "../reportes-ia.css";

const EJEMPLO = "Muéstrame los 5 productos más vendidos del mes pasado";

function celda(valor) {
  if (valor == null) return "—";
  if (typeof valor === "number") {
    return Number.isInteger(valor) ? String(valor) : valor.toFixed(2);
  }
  return String(valor);
}

function etiquetaProgreso(pct) {
  if (pct < 25) return "Interpretando tu pregunta…";
  if (pct < 55) return "Consultando la base de datos…";
  if (pct < 85) return "Armando tabla y gráfico…";
  if (pct < 100) return "Casi listo…";
  return "¡Listo!";
}

function ReportesIA() {
  const [prompt, setPrompt] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [mostrarProgreso, setMostrarProgreso] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);
  const [sqlAbierto, setSqlAbierto] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialCargando, setHistorialCargando] = useState(true);
  const [activoId, setActivoId] = useState(null);
  const [pdfCargando, setPdfCargando] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const intervaloRef = useRef(null);

  const detenerProgresoSuave = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  const iniciarProgreso = useCallback(() => {
    detenerProgresoSuave();
    setMostrarProgreso(true);
    setProgreso(6);
    intervaloRef.current = setInterval(() => {
      setProgreso((actual) => {
        if (actual >= 92) return actual;
        const salto = actual < 40 ? 4 : actual < 70 ? 2.5 : 1.2;
        return Math.min(92, actual + salto);
      });
    }, 220);
  }, [detenerProgresoSuave]);

  const completarProgreso = useCallback(() => {
    detenerProgresoSuave();
    setProgreso(100);
  }, [detenerProgresoSuave]);

  useEffect(() => () => detenerProgresoSuave(), [detenerProgresoSuave]);

  // Al llegar a 100%, ocultar la barra enseguida (el reporte ya está listo).
  useEffect(() => {
    if (progreso < 100 || cargando) return undefined;
    const t = setTimeout(() => setMostrarProgreso(false), 280);
    return () => clearTimeout(t);
  }, [progreso, cargando]);

  const cargarHistorial = useCallback(async () => {
    setHistorialCargando(true);
    try {
      const { data } = await fetchHistorialReportesIA({ page_size: TODOS });
      setHistorial(leerPagina(data).items);
    } catch {
      setHistorial([]);
    } finally {
      setHistorialCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  function limpiarArea() {
    setPrompt("");
    setError("");
    setResultado(null);
    setActivoId(null);
    setSqlAbierto(false);
    setDrawerAbierto(false);
    setMostrarProgreso(false);
    setProgreso(0);
  }

  async function onGenerar(evento) {
    evento.preventDefault();
    const texto = prompt.trim();
    if (texto.length < 5) {
      setError("Escribe una pregunta más específica (mínimo 5 caracteres).");
      return;
    }
    if (esFueraDeAmbito(texto)) {
      setError(MSG_SOLO_SISTEMA);
      setResultado(null);
      setActivoId(null);
      return;
    }

    setCargando(true);
    setError("");
    setResultado(null);
    setSqlAbierto(false);
    iniciarProgreso();

    try {
      const { data } = await generarReporteIA(texto);
      completarProgreso();
      setResultado(data);
      setActivoId(data.id);
      setPrompt("");
      await cargarHistorial();
    } catch (err) {
      detenerProgresoSuave();
      setMostrarProgreso(false);
      setProgreso(0);
      setResultado(null);
      setActivoId(null);
      setError(mensajeApi(err, "No se pudo generar el reporte con IA."));
    } finally {
      setCargando(false);
    }
  }

  async function onSeleccionar(id) {
    setError("");
    setSqlAbierto(false);
    setMostrarProgreso(false);
    setDrawerAbierto(false);
    try {
      const { data } = await fetchHistorialReporteIA(id);
      const snapshot = data.datos_json || {};
      setActivoId(data.id);
      setPrompt("");
      setResultado({
        id: data.id,
        prompt_usuario: data.prompt_usuario,
        sql: data.sql_generado,
        columnas: snapshot.columnas || [],
        datos: snapshot.datos || [],
        fecha_creacion: data.fecha_creacion,
        desdeHistorial: true,
      });
    } catch (err) {
      setError(mensajeApi(err, "No se pudo abrir el reporte del historial."));
    }
  }

  async function onEliminar(item) {
    const ok = await confirmar(
      `¿Eliminar el reporte “${(item.prompt_usuario || "").slice(0, 80)}”?`,
      {
        titulo: "Eliminar del historial",
        aceptar: "Eliminar",
        variante: "peligro",
      },
    );
    if (!ok) return;
    try {
      await eliminarHistorialReporteIA(item.id);
      if (activoId === item.id) limpiarArea();
      await cargarHistorial();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo eliminar el reporte."));
    }
  }

  async function onDescargarPdf() {
    if (!activoId) return;
    setPdfCargando(true);
    setError("");
    try {
      await descargarPdfHistorialReporteIA(activoId);
    } catch (err) {
      setError(mensajeApi(err, "No se pudo descargar el PDF."));
    } finally {
      setPdfCargando(false);
    }
  }

  const sidebar = (
    <HistorialSidebar
      items={historial}
      activoId={activoId}
      cargando={historialCargando}
      onSeleccionar={onSeleccionar}
      onEliminar={onEliminar}
      onNuevo={limpiarArea}
    />
  );

  const pctVisible = Math.round(progreso);

  return (
    <div className="reporte-ia-layout">
      <div className="reporte-ia-sidebar d-none d-lg-flex">{sidebar}</div>

      {drawerAbierto ? (
        <div className="reporte-ia-drawer d-lg-none">
          <div
            className="reporte-ia-drawer-fondo"
            onClick={() => setDrawerAbierto(false)}
            aria-hidden="true"
          />
          <div className="reporte-ia-drawer-panel">
            <button
              type="button"
              className="reporte-ia-drawer-cerrar"
              onClick={() => setDrawerAbierto(false)}
              aria-label="Cerrar historial"
            >
              <X size={18} />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="reporte-ia-trabajo">
        <header className="reporte-ia-head page-card">
          <div className="d-flex align-items-start justify-content-between gap-2">
            <div>
              <p className="reporte-ia-eyebrow">
                <Sparkles size={14} strokeWidth={2.25} />
                Inteligencia artificial
              </p>
              <h1>Reportes inteligentes</h1>
              <p className="text-muted mb-0">
                Pregunta en lenguaje natural. Los reportes se guardan en tu
                historial para reconsultarlos o exportarlos a PDF.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-light d-lg-none"
              onClick={() => setDrawerAbierto(true)}
              aria-label="Abrir historial"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

        <form className="page-card reporte-ia-form" onSubmit={onGenerar}>
          <label className="form-label fw-semibold" htmlFor="prompt-ia">
            Nuevo reporte
          </label>
          <textarea
            id="prompt-ia"
            className="form-control reporte-ia-input"
            rows={3}
            maxLength={500}
            placeholder={`Ej: ${EJEMPLO}`}
            value={prompt}
            disabled={cargando}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="reporte-ia-acciones">
            <button
              type="button"
              className="btn btn-light btn-sm"
              disabled={cargando}
              onClick={() => setPrompt(EJEMPLO)}
            >
              Usar ejemplo
            </button>
            <button type="submit" className="btn-reporte-ia" disabled={cargando}>
              {cargando ? (
                <>
                  <Loader2 size={18} className="reporte-ia-spin" />
                  Generando…
                </>
              ) : (
                <>
                  <Sparkles size={18} strokeWidth={2} />
                  Generar reporte
                </>
              )}
            </button>
          </div>

          {mostrarProgreso ? (
            <div className="reporte-ia-progreso" aria-live="polite">
              <div className="reporte-ia-progreso-meta">
                <span>{etiquetaProgreso(pctVisible)}</span>
                <strong>{pctVisible}%</strong>
              </div>
              <div className="reporte-ia-progreso-pista">
                <div
                  className="reporte-ia-progreso-barra"
                  style={{ width: `${pctVisible}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? <p className="text-danger mb-0 mt-3">{error}</p> : null}
        </form>

        {resultado && !cargando ? (
          <section className="page-card reporte-ia-resultado">
            <div className="reporte-ia-resultado-head">
              <div>
                <h2 className="h6 fw-bold mb-1">
                  {resultado.desdeHistorial ? "Desde historial" : "Resultado"}
                </h2>
                <p className="text-muted small mb-0">{resultado.prompt_usuario}</p>
              </div>
              {activoId ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                  disabled={pdfCargando}
                  onClick={onDescargarPdf}
                >
                  {pdfCargando ? (
                    <Loader2 size={16} className="reporte-ia-spin" />
                  ) : (
                    <FileDown size={16} />
                  )}
                  Descargar PDF
                </button>
              ) : null}
            </div>

            {resultado.datos?.length ? (
              <>
                <h2 className="h6 fw-bold mt-3">Visualización</h2>
                <ReporteIAChart
                  columnas={resultado.columnas}
                  datos={resultado.datos}
                />

                <h2 className="h6 fw-bold mt-4">Tabla</h2>
                <div className="table-responsive">
                  <table className="table table-hover table-sm align-middle mb-0">
                    <thead>
                      <tr className="text-muted">
                        {resultado.columnas.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.datos.map((fila, i) => (
                        <tr key={i}>
                          {resultado.columnas.map((col) => (
                            <td key={col}>{celda(fila[col])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  {resultado.datos.length} fila
                  {resultado.datos.length === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <p className="text-muted mb-0 mt-3">
                La consulta no devolvió filas. Prueba reformular la pregunta.
              </p>
            )}

            {resultado.sql ? (
              <div className="reporte-ia-sql-toggle mt-3">
                <button
                  type="button"
                  className="reporte-ia-sql-btn"
                  onClick={() => setSqlAbierto((v) => !v)}
                  aria-expanded={sqlAbierto}
                >
                  {sqlAbierto ? (
                    <ChevronDown size={16} strokeWidth={2} />
                  ) : (
                    <ChevronRight size={16} strokeWidth={2} />
                  )}
                  {sqlAbierto ? "Ocultar consulta SQL" : "Ver consulta SQL"}
                </button>
                {sqlAbierto ? (
                  <div className="reporte-ia-sql">
                    <code>{resultado.sql}</code>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default ReportesIA;
