import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, usePagina } from "../../../shared/paginado";
import { useProductos } from "../hooks/useInventario";
import { formatearDinero } from "../margen";
import MargenBadge from "./MargenBadge";

/** Se monta solo al desplegar la fila, así nunca trae el catálogo entero. */
function CategoriaDesglose({ categoria }) {
  const [pagina, setPagina] = usePagina(String(categoria.id_categoria));
  const { items: productos, total, error, cargando } = useProductos({
    categoria: categoria.id_categoria,
    pagina,
  });

  if (cargando) {
    return <p className="inv-desglose-vacio">Cargando productos...</p>;
  }

  if (error) {
    return <p className="inv-desglose-vacio">{error}</p>;
  }

  if (total === 0) {
    return (
      <p className="inv-desglose-vacio">
        Esta categoría todavía no tiene productos.
      </p>
    );
  }

  return (
    <>
      <table className="table inv-table inv-table-densa align-middle mb-0">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th className="text-end">Costo</th>
            <th className="text-end">Precio</th>
            <th className="text-end">Margen</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id_producto}>
              <td className="inv-sku">{producto.sku}</td>
              <td className="inv-nombre">{producto.nombre}</td>
              <td className="inv-num">{formatearDinero(producto.costo_actual)}</td>
              <td className="inv-num">{formatearDinero(producto.precio_venta)}</td>
              <td className="text-end">
                <MargenBadge valor={producto.margen_porcentaje} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion
        {...datosPaginacion(pagina, total)}
        etiqueta="productos"
        compacta
        onCambio={setPagina}
      />
    </>
  );
}

export default CategoriaDesglose;
