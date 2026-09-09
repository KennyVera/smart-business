import { Pencil } from "lucide-react";

function ProveedoresTable({ proveedores = [], onEditar }) {
  return (
    <div className="table-responsive">
      <table className="table inv-table align-middle mb-0">
        <thead>
          <tr>
            <th>RUC</th>
            <th>Razón social</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th aria-label="Editar" />
          </tr>
        </thead>
        <tbody>
          {proveedores.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-muted text-center py-4">
                No hay proveedores registrados.
              </td>
            </tr>
          ) : (
            proveedores.map((item) => (
              <tr key={item.id_proveedor}>
                <td>
                  <code className="inv-sku">{item.ruc}</code>
                </td>
                <td>
                  <strong>{item.razon_social}</strong>
                  <div className="text-muted small">{item.direccion}</div>
                </td>
                <td>{item.nombre_contacto}</td>
                <td>{item.telefono}</td>
                <td>{item.email}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    title="Editar"
                    onClick={() => onEditar?.(item)}
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProveedoresTable;
