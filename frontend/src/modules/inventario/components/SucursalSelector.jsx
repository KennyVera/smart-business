import { Store } from "lucide-react";

function SucursalSelector({ fija, sucursales, valor, onChange }) {
  if (fija) {
    return (
      <span className="inv-chip-sucursal">
        <Store size={14} strokeWidth={1.75} />
        {fija.nombre}
      </span>
    );
  }

  return (
    <div className="inv-filtro-select">
      <Store size={15} strokeWidth={1.75} />
      <select
        className="form-select"
        value={valor}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Todas las sucursales</option>
        {sucursales.map((sucursal) => (
          <option key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
            {sucursal.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SucursalSelector;
