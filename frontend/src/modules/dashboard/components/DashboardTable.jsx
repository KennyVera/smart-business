import { Settings } from "lucide-react";
import Paginacion from "../../../shared/Paginacion";
import { usePaginacion } from "../../../shared/usePaginacion";

function DashboardTable({ sucursales = [] }) {
  const pagina = usePaginacion(sucursales);

  return (
    <div className="page-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Sucursales recientes</h2>
        <Settings size={16} className="text-muted" />
      </div>
      <div className="table-responsive">
        <table className="table table-hover table-borderless align-middle mb-0">
          <thead>
            <tr className="text-muted">
              <th>Nombre</th>
              <th>Fecha de apertura</th>
              <th>Teléfono</th>
              <th>Ubicación</th>
              <th>Registrada</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted">
                  Aún no hay registros.
                </td>
              </tr>
            ) : (
              pagina.visibles.map((row) => (
                <tr key={row.nombre}>
                  <td>{row.nombre}</td>
                  <td>{row.fecha}</td>
                  <td>{row.telefono}</td>
                  <td>{row.ubicacion}</td>
                  <td>{row.registrada}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Paginacion {...pagina} etiqueta="sucursales" onCambio={pagina.irA} />
    </div>
  );
}

export default DashboardTable;
