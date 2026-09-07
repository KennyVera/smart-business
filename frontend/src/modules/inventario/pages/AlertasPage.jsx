import { AlertTriangle, CalendarClock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePagina } from "../../../shared/paginado";
import { fetchSucursalesAsignables } from "../../usuarios/api/usuariosApi";
import AlertasInventario from "../components/AlertasInventario";
import AlertasResumen from "../components/AlertasResumen";
import InventarioHeader from "../components/InventarioHeader";
import MermaFormModal from "../components/MermaFormModal";
import SucursalSelector from "../components/SucursalSelector";
import { useAlertas } from "../hooks/useInventario";
import { sucursalDeSesion } from "../sucursal";
import "../inventario.css";
import "../inventario-form.css";

const VENTANAS = [7, 15, 30, 60];

function AlertasPage() {
  const fija = useMemo(() => sucursalDeSesion(), []);
  const [sucursales, setSucursales] = useState([]);
  const [sucursal, setSucursal] = useState(fija ? String(fija.id) : "");
  const [dias, setDias] = useState(30);
  const [merma, setMerma] = useState({ open: false, fila: null });
  const [aviso, setAviso] = useState("");
  const clave = `${sucursal}|${dias}`;
  const [paginaCritico, setPaginaCritico] = usePagina(clave);
  const [paginaCaducar, setPaginaCaducar] = usePagina(clave);
  const { datos, error, cargando, recargar } = useAlertas({
    sucursal,
    dias,
    paginaCritico,
    paginaCaducar,
  });

  useEffect(() => {
    if (fija) return;
    fetchSucursalesAsignables()
      .then((response) => setSucursales(response.data))
      .catch(() => setSucursales([]));
  }, [fija]);

  return (
    <div className="page-card">
      <InventarioHeader
        icon={AlertTriangle}
        titulo="Alertas de stock y caducidad"
        detalle="Lo que hay que reponer y lo que hay que rotar antes de perderlo."
      >
        <SucursalSelector
          fija={fija}
          sucursales={sucursales}
          valor={sucursal}
          onChange={setSucursal}
        />
        <div className="inv-filtro-select">
          <CalendarClock size={15} strokeWidth={1.75} />
          <select
            className="form-select"
            value={dias}
            onChange={(event) => setDias(Number(event.target.value))}
          >
            {VENTANAS.map((valor) => (
              <option key={valor} value={valor}>
                Próximos {valor} días
              </option>
            ))}
          </select>
        </div>
      </InventarioHeader>

      <AlertasResumen resumen={datos.resumen} dias={datos.dias} />

      {aviso ? <p className="inv-aviso-ok">{aviso}</p> : null}
      {error ? <p className="text-danger mb-2">{error}</p> : null}
      {cargando ? <p className="text-muted mb-0">Cargando alertas...</p> : null}
      {!cargando && !error ? (
        <AlertasInventario
          datos={datos}
          mostrarSucursal={!fija}
          paginaCritico={paginaCritico}
          paginaCaducar={paginaCaducar}
          onPaginaCritico={setPaginaCritico}
          onPaginaCaducar={setPaginaCaducar}
          onMerma={(fila) => setMerma({ open: true, fila })}
        />
      ) : null}

      <MermaFormModal
        show={merma.open}
        fila={merma.fila}
        onClose={() => setMerma({ open: false, fila: null })}
        onSaved={() => {
          setAviso(`Merma registrada para ${merma.fila?.producto_nombre}.`);
          setMerma({ open: false, fila: null });
          recargar();
        }}
      />
    </div>
  );
}

export default AlertasPage;
