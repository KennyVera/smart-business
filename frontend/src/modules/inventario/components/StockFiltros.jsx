import { Search } from "lucide-react";
import { Form } from "react-bootstrap";
import SucursalSelector from "./SucursalSelector";

function StockFiltros({
  fija,
  sucursales,
  sucursal,
  busqueda,
  soloAlerta,
  onSucursal,
  onBusqueda,
  onSoloAlerta,
}) {
  return (
    <div className="inv-filtros">
      <SucursalSelector
        fija={fija}
        sucursales={sucursales}
        valor={sucursal}
        onChange={onSucursal}
      />
      <div className="inv-filtro-buscar">
        <Search size={15} strokeWidth={1.75} />
        <input
          type="search"
          className="form-control"
          value={busqueda}
          maxLength={60}
          placeholder="Buscar por SKU o nombre"
          onChange={(event) => onBusqueda(event.target.value)}
        />
      </div>
      <Form.Check
        type="switch"
        id="inv-solo-alerta"
        className="inv-switch"
        label="Solo bajo mínimo"
        checked={soloAlerta}
        onChange={(event) => onSoloAlerta(event.target.checked)}
      />
    </div>
  );
}

export default StockFiltros;
