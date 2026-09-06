import { Layers, Package, Pencil } from "lucide-react";

function CategoriasTable({ categorias, onEditar }) {
  if (categorias.length === 0) {
    return <p className="text-muted mb-0">Todavía no hay categorías registradas.</p>;
  }

  return (
    <div className="table-responsive inv-wrap">
      <table className="table inv-table align-middle mb-0">
        <thead>
          <tr>
            <th><span className="inv-th"><Layers size={13} /> Categoría</span></th>
            <th><span className="inv-th"><Package size={13} /> Productos</span></th>
            <th className="text-end"><span className="inv-th">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id_categoria}>
              <td className="inv-nombre">{categoria.nombre}</td>
              <td>
                <span className="inv-chip">{categoria.total_productos}</span>
              </td>
              <td>
                <div className="inv-acciones">
                  <button
                    type="button"
                    title="Editar categoría"
                    onClick={() => onEditar(categoria)}
                  >
                    <Pencil size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoriasTable;
