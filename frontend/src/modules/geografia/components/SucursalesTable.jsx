import SucursalAcciones from "./SucursalAcciones";
import SucursalEstado from "./SucursalEstado";

function SucursalesTable({ sucursales, onEditar, onDesactivar, onDetalle }) {
  if (sucursales.length === 0) {
    return <p className="text-muted mb-0">Aún no hay sucursales.</p>;
  }

  return (
    <div className="table-responsive sucursales-wrap">
      <table className="table sucursales-table align-middle mb-0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cantón</th>
            <th>Zona</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sucursales.map((sucursal) => (
            <tr
              key={sucursal.id_nombre}
              className="sucursal-row"
              onClick={() => onDetalle(sucursal)}
            >
              <td className="sucursal-nombre">{sucursal.nombre}</td>
              <td>{sucursal.canton_nombre}</td>
              <td className="text-muted">{sucursal.zona_nombre}</td>
              <td className="sucursal-tel">{sucursal.telefono || "—"}</td>
              <td>
                <SucursalEstado activa={sucursal.activa} />
              </td>
              <td>
                <SucursalAcciones
                  sucursal={sucursal}
                  onEditar={onEditar}
                  onDesactivar={onDesactivar}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SucursalesTable;
