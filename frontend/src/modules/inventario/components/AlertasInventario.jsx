import CaducidadCard from "./CaducidadCard";
import StockCriticoCard from "./StockCriticoCard";

function AlertasInventario({ datos, mostrarSucursal, onMerma }) {
  return (
    <div className="inv-cards">
      <StockCriticoCard
        filas={datos.stock_critico}
        mostrarSucursal={mostrarSucursal}
        onMerma={onMerma}
      />
      <CaducidadCard
        lotes={datos.por_caducar}
        dias={datos.dias}
        mostrarSucursal={mostrarSucursal}
      />
    </div>
  );
}

export default AlertasInventario;
