import { PackageSearch } from "lucide-react";
import ProductoCard from "./ProductoCard";

function ProductoGrid({ filas, cargando, onAgregar }) {
  if (cargando) {
    return <p className="pos-vacio">Cargando catálogo...</p>;
  }
  if (filas.length === 0) {
    return (
      <p className="pos-vacio">
        <PackageSearch size={22} strokeWidth={1.5} />
        No hay productos con esa búsqueda en tu sucursal.
      </p>
    );
  }

  return (
    <div className="pos-grid">
      {filas.map((fila) => (
        <ProductoCard key={fila.id_producto} fila={fila} onAgregar={onAgregar} />
      ))}
    </div>
  );
}

export default ProductoGrid;
