import { leerPagina } from "../../../shared/paginado";
import CaducidadCard from "./CaducidadCard";
import StockCriticoCard from "./StockCriticoCard";

function AlertasInventario({
  datos,
  mostrarSucursal,
  paginaCritico,
  paginaCaducar,
  onPaginaCritico,
  onPaginaCaducar,
  onMerma,
}) {
  const criticos = leerPagina(datos.stock_critico);
  const lotes = leerPagina(datos.por_caducar);

  return (
    <div className="inv-cards">
      <StockCriticoCard
        filas={criticos.items}
        total={criticos.total}
        pagina={paginaCritico}
        mostrarSucursal={mostrarSucursal}
        onPagina={onPaginaCritico}
        onMerma={onMerma}
      />
      <CaducidadCard
        lotes={lotes.items}
        total={lotes.total}
        pagina={paginaCaducar}
        dias={datos.dias}
        mostrarSucursal={mostrarSucursal}
        onPagina={onPaginaCaducar}
      />
    </div>
  );
}

export default AlertasInventario;
