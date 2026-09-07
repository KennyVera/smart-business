import { ChevronDown, Layers, Package, Pencil } from "lucide-react";
import { useState } from "react";
import CategoriaDesglose from "./CategoriaDesglose";

function CategoriasTable({ categorias, onEditar }) {
  const [abiertas, setAbiertas] = useState(() => new Set());

  if (categorias.length === 0) {
    return <p className="text-muted mb-0">Todavía no hay categorías registradas.</p>;
  }

  function toggle(id) {
    setAbiertas((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
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
            <CategoriaFila
              key={categoria.id_categoria}
              categoria={categoria}
              abierta={abiertas.has(categoria.id_categoria)}
              onToggle={() => toggle(categoria.id_categoria)}
              onEditar={onEditar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriaFila({ categoria, abierta, onToggle, onEditar }) {
  return (
    <>
      <tr className={`inv-cat-fila${abierta ? " is-open" : ""}`}>
        <td>
          <button
            type="button"
            className="inv-cat-toggle"
            aria-expanded={abierta}
            onClick={onToggle}
          >
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`inv-cat-chevron${abierta ? " is-open" : ""}`}
            />
            <span className="inv-nombre">{categoria.nombre}</span>
          </button>
        </td>
        <td>
          <button
            type="button"
            className="inv-chip inv-chip-toggle"
            aria-expanded={abierta}
            onClick={onToggle}
          >
            {categoria.total_productos}
          </button>
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
      {abierta ? (
        <tr className="inv-cat-desglose">
          <td colSpan={3}>
            <CategoriaDesglose categoria={categoria} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default CategoriasTable;
