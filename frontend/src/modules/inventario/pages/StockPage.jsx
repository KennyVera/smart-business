import { Boxes } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, usePagina } from "../../../shared/paginado";
import { fetchSucursalesAsignables } from "../../usuarios/api/usuariosApi";
import InventarioHeader from "../components/InventarioHeader";
import MermaFormModal from "../components/MermaFormModal";
import StockAjusteModal from "../components/StockAjusteModal";
import StockFiltros from "../components/StockFiltros";
import StockTable from "../components/StockTable";
import { useStock } from "../hooks/useInventario";
import { useDebounce } from "../hooks/useRecurso";
import { sucursalDeSesion } from "../sucursal";
import "../inventario.css";
import "../inventario-form.css";

function StockPage() {
  const fija = useMemo(() => sucursalDeSesion(), []);
  const [sucursales, setSucursales] = useState([]);
  const [sucursal, setSucursal] = useState(fija ? String(fija.id) : "");
  const [texto, setTexto] = useState("");
  const [soloAlerta, setSoloAlerta] = useState(false);
  const [ajuste, setAjuste] = useState({ open: false, fila: null });
  const [merma, setMerma] = useState({ open: false, fila: null });
  const [aviso, setAviso] = useState("");
  const buscar = useDebounce(texto, 250);
  const [pagina, setPagina] = usePagina(`${sucursal}|${buscar}|${soloAlerta}`);
  const { items: filas, total, error, cargando, recargar } = useStock({
    sucursal,
    buscar,
    soloAlerta,
    pagina,
  });

  useEffect(() => {
    if (fija) return;
    fetchSucursalesAsignables()
      .then((response) => setSucursales(response.data))
      .catch(() => setSucursales([]));
  }, [fija]);

  const detalle = soloAlerta
    ? `${total} productos bajo el mínimo con estos filtros.`
    : `${total} productos con estos filtros.`;

  return (
    <div className="page-card">
      <InventarioHeader icon={Boxes} titulo="Control de stock" detalle={detalle} />

      <StockFiltros
        fija={fija}
        sucursales={sucursales}
        sucursal={sucursal}
        busqueda={texto}
        soloAlerta={soloAlerta}
        onSucursal={setSucursal}
        onBusqueda={setTexto}
        onSoloAlerta={setSoloAlerta}
      />

      {aviso ? <p className="inv-aviso-ok">{aviso}</p> : null}
      {error ? <p className="text-danger mb-2">{error}</p> : null}
      {cargando ? <p className="text-muted mb-0">Cargando stock...</p> : null}
      {!cargando && !error ? (
        <>
          <StockTable
            filas={filas}
            mostrarSucursal={!fija}
            onAjustar={(fila) => setAjuste({ open: true, fila })}
            onMerma={(fila) => setMerma({ open: true, fila })}
          />
          <Paginacion
            {...datosPaginacion(pagina, total)}
            etiqueta="productos"
            onCambio={setPagina}
          />
        </>
      ) : null}

      <StockAjusteModal
        show={ajuste.open}
        fila={ajuste.fila}
        onClose={() => setAjuste({ open: false, fila: null })}
        onSaved={() => {
          setAviso("Stock ajustado.");
          setAjuste({ open: false, fila: null });
          recargar();
        }}
      />
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

export default StockPage;
