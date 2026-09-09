import { Download, Search, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Paginacion from "../../../shared/Paginacion";
import {
  leerPagina,
  useDatosPaginacion,
  usePagina,
} from "../../../shared/paginado";
import { useFilasPorPagina } from "../../../context/PreferencesContext";
import { mensajeApi } from "../../usuarios/rol";
import {
  exportarClientesGerente,
  fetchClientesGerente,
} from "../api/clientesGerenteApi";
import OffcanvasCliente from "../components/OffcanvasCliente";
import TablaClientes from "../components/TablaClientes";
import "../gerente.css";

const REPORTES = [
  { value: "todos", label: "Todos los clientes" },
  { value: "top_gastos", label: "Top Gastos (Mayor valor)" },
  { value: "top_frecuentes", label: "Top Frecuentes (Más visitas)" },
  { value: "riesgo_abandono", label: "En riesgo de abandono (+30 días)" },
  { value: "cumpleanos_mes", label: "Cumpleañeros del mes" },
  { value: "cumpleanos_hoy", label: "Cumpleañeros de hoy" },
];

function ClientesList() {
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [reporte, setReporte] = useState("todos");
  const [pagina, setPagina] = usePagina(`${busqueda}|${reporte}`);
  const pageSize = useFilasPorPagina();
  const [clientes, setClientes] = useState([]);
  const [total, setTotal] = useState(0);
  const [resumen, setResumen] = useState({ vips: 0, cumple: 0 });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [activo, setActivo] = useState(null);
  const paginacionUi = useDatosPaginacion(pagina, total);

  const cargar = useCallback(
    (texto, page, tipo) => {
      setCargando(true);
      setError("");
      const params = {
        page,
        page_size: pageSize,
        reporte: tipo || "todos",
      };
      if (texto) params.q = texto;
      fetchClientesGerente(params)
        .then(({ data }) => {
          const leida = leerPagina(data);
          setClientes(leida.items);
          setTotal(leida.total);
          setResumen({
            vips: leida.items.filter((c) => c.es_vip).length,
            cumple: leida.items.filter((c) => c.cumple_mes).length,
          });
        })
        .catch((err) => setError(mensajeApi(err, "No se pudo cargar clientes.")))
        .finally(() => setCargando(false));
    },
    [pageSize]
  );

  useEffect(() => {
    cargar(busqueda, pagina, reporte);
  }, [cargar, busqueda, pagina, reporte]);

  function buscar(e) {
    e.preventDefault();
    setBusqueda(q.trim());
  }

  async function exportar() {
    setExportando(true);
    setError("");
    try {
      const params = { reporte };
      if (busqueda) params.q = busqueda;
      const { data } = await exportarClientesGerente(params);
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clientes_${reporte}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(mensajeApi(err, "No se pudo exportar el reporte."));
    } finally {
      setExportando(false);
    }
  }

  function onActualizado(data) {
    setClientes((prev) =>
      prev.map((item) =>
        item.id_cliente === data.id_cliente
          ? {
              ...item,
              ...data,
            }
          : item
      )
    );
    setActivo((prev) =>
      prev?.id_cliente === data.id_cliente ? { ...prev, ...data } : prev
    );
  }

  return (
    <div className="gerente-page">
      <header className="gerente-page-head gerente-clientes-head">
        <div>
          <p className="gerente-eyebrow">CRM analítico</p>
          <h1>Clientes</h1>
          <p className="text-muted mb-0">
            Relación comercial de tu sucursal con métricas de compra.
          </p>
        </div>
        <div className="gerente-clientes-kpis">
          <article>
            <Users size={16} />
            <div>
              <small>Total</small>
              <strong>{total}</strong>
            </div>
          </article>
          <article>
            <small>VIP en página</small>
            <strong>{resumen.vips}</strong>
          </article>
          <article>
            <small>Cumpleaños</small>
            <strong>{resumen.cumple}</strong>
          </article>
        </div>
      </header>

      <form className="gerente-filtros page-card gerente-clientes-filtros mb-3" onSubmit={buscar}>
        <label className="gerente-filtro-campo flex-grow-1">
          <span>Buscar cliente</span>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} />
            </span>
            <input
              className="form-control border-start-0"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre o cédula/RUC"
            />
          </div>
        </label>
        <label className="gerente-filtro-campo gerente-filtro-reporte">
          <span>Reporte estratégico</span>
          <select
            className="form-select"
            value={reporte}
            onChange={(e) => setReporte(e.target.value)}
            aria-label="Reporte estratégico"
          >
            {REPORTES.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn gerente-btn">
          Filtrar
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary gerente-btn-export"
          onClick={exportar}
          disabled={exportando}
        >
          <Download size={16} />
          {exportando ? "Exportando…" : "Exportar reporte (CSV)"}
        </button>
      </form>

      {error ? <p className="text-danger">{error}</p> : null}
      {cargando ? <p className="text-muted">Cargando clientes…</p> : null}
      {!cargando ? (
        <>
          <TablaClientes
            clientes={clientes}
            onVerDetalle={setActivo}
            resaltarRiesgo={reporte === "riesgo_abandono"}
          />
          <Paginacion
            {...paginacionUi}
            etiqueta="clientes"
            onCambio={setPagina}
          />
        </>
      ) : null}

      <OffcanvasCliente
        show={Boolean(activo?.id_cliente)}
        cliente={activo}
        onClose={() => setActivo(null)}
        onActualizado={onActualizado}
      />
    </div>
  );
}

export default ClientesList;
