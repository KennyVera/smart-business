import { FileBarChart, FileDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePreferences } from "../../../context/PreferencesContext";
import { puedeVerGerencial } from "../../usuarios/rbac";
import { fetchSucursalesAsignables } from "../../usuarios/api/usuariosApi";
import { leerSesion } from "../../usuarios/auth/sesion";
import { fetchReporte, fetchReporteClientesCrm } from "../api/inventarioApi";
import { ACENTO_DEF, varsAcento } from "../coloresReporte";
import InventarioHeader from "../components/InventarioHeader";
import ReporteCard from "../components/ReporteCard";
import ReporteCardCrm from "../components/ReporteCardCrm";
import ReporteFiltros from "../components/ReporteFiltros";
import ReporteGrafico from "../components/ReporteGrafico";
import ReporteLeyenda from "../components/ReporteLeyenda";
import ReportePdfDocumento from "../components/ReportePdfDocumento";
import ReporteResumen from "../components/ReporteResumen";
import ReporteTabla from "../components/ReporteTabla";
import SucursalSelector from "../components/SucursalSelector";
import {
  esperar,
  esperarImagenes,
  generarPdf,
  graficoAImagen,
  nombreArchivo,
  selloAuditoria,
} from "../pdf";
import {
  CLAVE_CRM,
  REPORTES,
  alcanceDe,
  buscarReporte,
  columnasVisibles,
  parametrosDe,
  rangoPorDefecto,
} from "../reportes";
import { sucursalDeSesion } from "../sucursal";
import "../inventario.css";
import "../reportes.css";

const ESPERA_GRAFICO = 450;
const COLS_LANDSCAPE = 6;

function limiteCrm(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 10;
  return Math.min(Math.max(Math.trunc(n), 1), 100);
}

function ReportesInventario() {
  const fija = useMemo(() => sucursalDeSesion(), []);
  const sesion = useMemo(() => leerSesion(), []);
  const verCrm = puedeVerGerencial();
  const { colorGraficos } = usePreferences();
  const tema = varsAcento(colorGraficos || ACENTO_DEF);
  const [sucursales, setSucursales] = useState([]);
  const [filtros, setFiltros] = useState(() => ({
    sucursal: fija ? String(fija.id) : "",
    dias: 60,
    ...rangoPorDefecto(30),
  }));
  const [crmTipo, setCrmTipo] = useState("top_gastos");
  const [crmLimite, setCrmLimite] = useState(10);
  const [activo, setActivo] = useState(null);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [trabajo, setTrabajo] = useState(null);
  const [imagen, setImagen] = useState("");
  const graficoRef = useRef(null);
  const pdfRef = useRef(null);

  const esCrm = activo === CLAVE_CRM;
  const reporte = buscarReporte(activo);
  const columnas = reporte ? columnasVisibles(reporte, !fija && !esCrm) : [];
  const landscape = columnas.length >= COLS_LANDSCAPE;
  const params = reporte && !esCrm ? parametrosDe(reporte, filtros) : null;
  const crmParams = { tipo: crmTipo, limite: limiteCrm(crmLimite) };
  const consulta = JSON.stringify(
    esCrm ? [activo, crmParams] : [activo, params],
  );
  const nombreSucursal = fija
    ? fija.nombre
    : sucursales.find((item) => String(item.id_sucursal) === filtros.sucursal)?.nombre || "";
  const vigentes = datos?.clave === activo ? datos : null;
  const alcance = reporte ? alcanceDe(reporte, vigentes, nombreSucursal) : "";
  const listo = Boolean(vigentes) && !cargando && !error;
  const graficoMeta = esCrm
    ? {
        tipo: "barras",
        titulo:
          crmTipo === "cumpleanos_mes"
            ? "Cumpleañeros del mes"
            : "Ranking de clientes",
        medida: crmTipo === "top_gastos" ? "dinero" : "numero",
      }
    : reporte?.grafico;

  useEffect(() => {
    if (fija) return;
    fetchSucursalesAsignables()
      .then((response) => setSucursales(response.data))
      .catch(() => setSucursales([]));
  }, [fija]);

  useEffect(() => {
    if (!reporte) {
      setDatos(null);
      return undefined;
    }
    let vivo = true;
    setCargando(true);
    setError("");
    setImagen("");
    const pedido = esCrm
      ? fetchReporteClientesCrm(crmParams)
      : fetchReporte(reporte.ruta, params);
    pedido
      .then(({ data }) => vivo && setDatos({ ...data, clave: reporte.clave }))
      .catch(() => {
        if (!vivo) return;
        setDatos(null);
        setError("No se pudo generar el reporte. Intenta de nuevo.");
      })
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [consulta]);

  useEffect(() => {
    if (trabajo?.fase !== "datos") return undefined;
    if (error) {
      setTrabajo(null);
      return undefined;
    }
    if (cargando || datos?.clave !== trabajo.clave) return undefined;
    let vivo = true;
    (async () => {
      await esperar(ESPERA_GRAFICO);
      const png = await graficoAImagen(
        graficoRef.current?.querySelector("svg"),
        graficoMeta?.tipo === "pastel",
      );
      if (!vivo) return;
      setImagen(png);
      setTrabajo({ ...trabajo, fase: "render" });
    })();
    return () => {
      vivo = false;
    };
  }, [trabajo, datos, cargando, error]);

  useEffect(() => {
    if (trabajo?.fase !== "render" || !pdfRef.current) return undefined;
    let vivo = true;
    (async () => {
      try {
        await esperarImagenes(pdfRef.current);
        await esperar(80);
        if (!vivo) return;
        await generarPdf(pdfRef.current, nombreArchivo(datos.titulo), {
          landscape,
        });
      } catch {
        if (vivo) setError("No se pudo generar el PDF.");
      }
      if (vivo) setTrabajo(null);
    })();
    return () => {
      vivo = false;
    };
  }, [trabajo, landscape, datos?.titulo]);

  function cambiar(cambios) {
    setFiltros((actual) => ({ ...actual, ...cambios }));
  }

  function descargar(clave) {
    setActivo(clave);
    setTrabajo({ clave, fase: "datos", auditoria: selloAuditoria(sesion) });
  }

  const Icono = reporte?.icono;

  return (
    <div className="page-card" style={tema}>
      <InventarioHeader
        icon={FileBarChart}
        titulo="Reportes operativos"
        detalle="Auditoría de inventario lista para imprimir, firmar y archivar."
      >
        <SucursalSelector
          fija={fija}
          sucursales={sucursales}
          valor={filtros.sucursal}
          onChange={(valor) => cambiar({ sucursal: valor })}
        />
      </InventarioHeader>

      <div className="rep-grid">
        {REPORTES.map((item) => (
          <ReporteCard
            key={item.clave}
            reporte={item}
            activo={activo === item.clave}
            generando={trabajo?.clave === item.clave}
            bloqueado={Boolean(trabajo)}
            onVer={() => setActivo(item.clave)}
            onPdf={() => descargar(item.clave)}
          />
        ))}
        {verCrm ? (
          <ReporteCardCrm
            activo={esCrm}
            generando={trabajo?.clave === CLAVE_CRM}
            bloqueado={Boolean(trabajo)}
            tipo={crmTipo}
            limite={crmLimite}
            onTipo={setCrmTipo}
            onLimite={setCrmLimite}
            onVer={() => setActivo(CLAVE_CRM)}
            onPdf={() => descargar(CLAVE_CRM)}
          />
        ) : null}
      </div>

      {reporte ? (
        <section className="rep-vista">
          <div className="rep-vista-head">
            <div>
              <h3>
                <Icono size={17} strokeWidth={1.75} />
                {vigentes?.titulo || reporte.titulo}
              </h3>
              <p>{alcance}</p>
            </div>
            <div className="rep-vista-acciones">
              {!esCrm ? (
                <ReporteFiltros reporte={reporte} filtros={filtros} onCambio={cambiar} />
              ) : null}
              <button
                type="button"
                className="btn-rep"
                onClick={() => descargar(reporte.clave)}
                disabled={Boolean(trabajo) || !listo}
              >
                <FileDown size={15} strokeWidth={1.75} />
                {trabajo ? "Generando..." : "Descargar PDF"}
              </button>
              <button
                type="button"
                className="rep-cerrar"
                title="Cerrar reporte"
                onClick={() => setActivo(null)}
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {error ? <p className="text-danger mb-0">{error}</p> : null}
          {cargando ? <p className="text-muted mb-0">Calculando reporte...</p> : null}

          {listo ? (
            <>
              <ReporteResumen datos={vigentes.resumen} />
              {vigentes.grafico?.length ? (
                <div className={`rep-visual is-${graficoMeta.tipo}`}>
                  <ReporteGrafico
                    tipo={graficoMeta.tipo}
                    titulo={graficoMeta.titulo}
                    datos={vigentes.grafico}
                    medida={graficoMeta.medida}
                    horizontal={esCrm}
                    innerRef={graficoRef}
                  />
                  {graficoMeta.tipo === "pastel" ? (
                    <ReporteLeyenda datos={vigentes.grafico} medida={graficoMeta.medida} />
                  ) : null}
                </div>
              ) : null}
              <ReporteTabla columnas={columnas} filas={vigentes.filas} />
            </>
          ) : null}
        </section>
      ) : (
        <p className="rep-vacio">
          Elige un reporte para verlo en pantalla o descargarlo firmado en PDF.
        </p>
      )}

      {listo && graficoMeta ? (
        <ReportePdfDocumento
          innerRef={pdfRef}
          datos={vigentes}
          columnas={columnas}
          grafico={graficoMeta}
          imagenGrafico={imagen}
          auditoria={trabajo?.auditoria || selloAuditoria(sesion)}
          alcance={alcance}
          landscape={landscape}
        />
      ) : null}
    </div>
  );
}

export default ReportesInventario;
