import {
  Barcode,
  CircleDollarSign,
  PackagePlus,
  Pencil,
  Tag,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { formatearDinero } from "../margen";
import MargenBadge from "./MargenBadge";

function ProductoList({ productos, onEditar, onLote }) {
  if (productos.length === 0) {
    return <p className="text-muted mb-0">Ningún producto coincide con la búsqueda.</p>;
  }

  return (
    <div className="table-responsive inv-wrap">
      <table className="table inv-table inv-table-densa align-middle mb-0">
        <thead>
          <tr>
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
          {productos.map((producto) => (
            <tr key={producto.id_producto}>
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
                    <Pencil size={16} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    title="Ingresar lote con fecha de vencimiento"
                    onClick={() => onLote(producto)}
                  >
                    <PackagePlus size={16} strokeWidth={1.75} />
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

export default ProductoList;
