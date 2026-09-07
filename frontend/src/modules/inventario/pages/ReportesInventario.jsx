import { FileBarChart, FileDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchSucursalesAsignables } from "../../usuarios/api/usuariosApi";
import { leerSesion } from "../../usuarios/auth/sesion";
import { fetchReporte } from "../api/inventarioApi";
import InventarioHeader from "../components/InventarioHeader";
import ReporteCard from "../components/ReporteCard";
import ReporteFiltros from "../components/ReporteFiltros";
import ReporteGrafico from "../components/ReporteGrafico";
import ReporteLeyenda from "../components/ReporteLeyenda";
import ReportePdfDocumento from "../components/ReportePdfDocumento";
import ReporteResumen from "../components/ReporteResumen";
import ReporteTabla from "../components/ReporteTabla";
import SucursalSelector from "../components/SucursalSelector";
import {
  esperar,
  generarPdf,
  graficoAImagen,
  nombreArchivo,
  selloAuditoria,
} from "../pdf";
import {
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

function ReportesInventario() {
  const fija = useMemo(() => sucursalDeSesion(), []);
  const sesion = useMemo(() => leerSesion(), []);
  const [sucursales, setSucursales] = useState([]);
  const [filtros, setFiltros] = useState(() => ({
    sucursal: fija ? String(fija.id) : "",
    dias: 60,
    ...rangoPorDefecto(30),
  }));
  const [activo, setActivo] = useState(null);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [trabajo, setTrabajo] = useState(null);
  const [imagen, setImagen] = useState("");
  const graficoRef = useRef(null);
  const pdfRef = useRef(null);

  const reporte = buscarReporte(activo);
  const columnas = reporte ? columnasVisibles(reporte, !fija) : [];
  const params = reporte ? parametrosDe(reporte, filtros) : null;
  const consulta = JSON.stringify([activo, params]);
  const nombreSucursal = fija
    ? fija.nombre
    : sucursales.find((item) => String(item.id_sucursal) === filtros.sucursal)?.nombre || "";
  // Mientras carga otro reporte no se muestran los datos del anterior.
  const vigentes = datos?.clave === activo ? datos : null;
  const alcance = reporte ? alcanceDe(reporte, vigentes, nombreSucursal) : "";
  const listo = Boolean(vigentes) && !cargando && !error;

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
    fetchReporte(reporte.ruta, params)
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

  // Paso 1 del PDF: con los datos en pantalla, el gráfico SVG pasa a imagen.
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
        reporte.grafico.tipo === "pastel",
      );
      if (!vivo) return;
      setImagen(png);
      setTrabajo({ ...trabajo, fase: "render" });
    })();
    return () => {
      vivo = false;
    };
  }, [trabajo, datos, cargando, error]);

  // Paso 2: la plantilla oculta ya está montada con la imagen, se exporta.
  useEffect(() => {
    if (trabajo?.fase !== "render" || !pdfRef.current) return undefined;
    let vivo = true;
    (async () => {
      try {
        await generarPdf(pdfRef.current, nombreArchivo(datos.titulo));
      } catch {
        if (vivo) setError("No se pudo generar el PDF.");
      }
      if (vivo) setTrabajo(null);
    })();
    return () => {
      vivo = false;
    };
  }, [trabajo]);

  function cambiar(cambios) {
    setFiltros((actual) => ({ ...actual, ...cambios }));
  }

  function descargar(item) {
    setActivo(item.clave);
    setTrabajo({ clave: item.clave, fase: "datos", auditoria: selloAuditoria(sesion) });
  }

  const Icono = reporte?.icono;

  return (
    <div className="page-card">
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
            onPdf={() => descargar(item)}
          />
        ))}
      </div>

      {reporte ? (
        <section className="rep-vista">
          <div className="rep-vista-head">
            <div>
              <h3>
                <Icono size={17} strokeWidth={1.75} />
                {reporte.titulo}
              </h3>
              <p>{alcance}</p>
            </div>
            <div className="rep-vista-acciones">
              <ReporteFiltros reporte={reporte} filtros={filtros} onCambio={cambiar} />
              <button
                type="button"
                className="btn-rep"
                onClick={() => descargar(reporte)}
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
              {vigentes.grafico.length ? (
                <div className={`rep-visual is-${reporte.grafico.tipo}`}>
                  <ReporteGrafico
                    tipo={reporte.grafico.tipo}
                    titulo={reporte.grafico.titulo}
                    datos={vigentes.grafico}
                    innerRef={graficoRef}
                  />
                  {reporte.grafico.tipo === "pastel" ? (
                    <ReporteLeyenda datos={vigentes.grafico} medida={reporte.grafico.medida} />
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

      {listo ? (
        <ReportePdfDocumento
          innerRef={pdfRef}
          datos={vigentes}
          columnas={columnas}
          grafico={reporte.grafico}
          imagenGrafico={imagen}
          auditoria={trabajo?.auditoria || selloAuditoria(sesion)}
          alcance={alcance}
        />
      ) : null}
    </div>
  );
}

export default ReportesInventario;
