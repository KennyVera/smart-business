import {
  Barcode,
  CircleDollarSign,
  ClipboardList,
  Edit2,
  Package,
  Tag,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { formatearDinero } from "../margen";
import MargenBadge from "./MargenBadge";

function ProductoList({
  productos,
  seleccion,
  onSeleccion,
  onSeleccionTodos,
  onEditar,
  onLote,
  onKardex,
}) {
  if (productos.length === 0) {
    return <p className="text-muted mb-0">Ningún producto coincide con la búsqueda.</p>;
  }

  // El check maestro trabaja sobre la página visible, no sobre todo el catálogo.
  const todos = productos.every((producto) => seleccion.has(producto.id_producto));
  const algunos = !todos && productos.some((p) => seleccion.has(p.id_producto));

  return (
    <div className="table-responsive inv-wrap">
      <table className="table inv-table inv-table-densa align-middle mb-0">
        <thead>
          <tr>
            <th className="inv-col-check">
              <input
                type="checkbox"
                className="form-check-input"
                title="Seleccionar los de esta página"
                checked={todos}
                ref={(nodo) => {
                  if (nodo) nodo.indeterminate = algunos;
                }}
                onChange={(event) => onSeleccionTodos(event.target.checked)}
              />
            </th>
            <th><span className="inv-th"><Barcode size={13} /> SKU</span></th>
            <th><span className="inv-th"><Tag size={13} /> Nombre</span></th>
            <th><span className="inv-th">Categoría</span></th>
            <th className="text-end">
              <span className="inv-th"><CircleDollarSign size={13} /> Costo</span>
            </th>
            <th className="text-end"><span className="inv-th">Precio</span></th>
            <th className="text-end">
              <span className="inv-th"><TrendingUp size={13} /> Margen</span>
            </th>
            <th className="text-end">
              <span className="inv-th"><Wrench size={13} /> Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const marcado = seleccion.has(producto.id_producto);
            return (
              <tr
                key={producto.id_producto}
                className={marcado ? "inv-row-marcada" : undefined}
              >
                <td className="inv-col-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    title={`Seleccionar ${producto.nombre}`}
                    checked={marcado}
                    onChange={() => onSeleccion(producto.id_producto)}
                  />
                </td>
                <td className="inv-sku">{producto.sku}</td>
                <td className="inv-nombre">{producto.nombre}</td>
                <td>
                  <span className="inv-chip">{producto.categoria_nombre}</span>
                </td>
                <td className="inv-num">{formatearDinero(producto.costo_actual)}</td>
                <td className="inv-num">{formatearDinero(producto.precio_venta)}</td>
                <td className="text-end">
                  <MargenBadge valor={producto.margen_porcentaje} />
                </td>
                <td>
                  <div className="inv-acciones">
                    <button
                      type="button"
                      title="Editar producto"
                      onClick={() => onEditar(producto)}
                    >
                      <Edit2 size={16} strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      title="Ingresar lote con fecha de vencimiento"
                      onClick={() => onLote(producto)}
                    >
                      <Package size={16} strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      title="Kardex: historial de movimientos"
                      onClick={() => onKardex(producto)}
                    >
                      <ClipboardList size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProductoList;
