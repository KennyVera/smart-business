import { Barcode, Boxes, PackageMinus, SlidersHorizontal, Store, Tag } from "lucide-react";
import { nivelStock } from "../margen";

const ETIQUETA = {
  critico: "Sin stock",
  bajo: "Bajo mínimo",
  normal: "Suficiente",
};

function StockTable({ filas, mostrarSucursal, onAjustar, onMerma }) {
  if (filas.length === 0) {
    return <p className="text-muted mb-0">No hay stock registrado con esos filtros.</p>;
  }

  return (
    <div className="table-responsive inv-wrap">
      <table className="table inv-table align-middle mb-0">
        <thead>
          <tr>
            <th><span className="inv-th"><Barcode size={13} /> SKU</span></th>
            <th><span className="inv-th"><Tag size={13} /> Producto</span></th>
            {mostrarSucursal ? (
              <th><span className="inv-th"><Store size={13} /> Sucursal</span></th>
            ) : null}
            <th className="text-end">
              <span className="inv-th"><Boxes size={13} /> Actual</span>
            </th>
            <th className="text-end"><span className="inv-th">Mínimo</span></th>
            <th><span className="inv-th">Estado</span></th>
            <th className="text-end"><span className="inv-th">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const nivel = nivelStock(fila);
            return (
              <tr
                key={`${fila.id_sucursal}-${fila.id_producto}`}
                className={`inv-row is-${nivel}`}
              >
                <td className="inv-sku">{fila.sku}</td>
                <td className="inv-nombre">{fila.producto_nombre}</td>
                {mostrarSucursal ? (
                  <td className="text-muted">{fila.sucursal_nombre}</td>
                ) : null}
                <td className="inv-num inv-num-fuerte">{fila.cantidad_actual}</td>
                <td className="inv-num text-muted">{fila.stock_minimo}</td>
                <td>
                  <span className={`inv-estado is-${nivel}`}>
                    {ETIQUETA[nivel]}
                    {fila.faltante > 0 ? ` · faltan ${fila.faltante}` : ""}
                  </span>
                </td>
                <td>
                  <div className="inv-acciones">
                    <button
                      type="button"
                      title="Ajustar stock y mínimo"
                      onClick={() => onAjustar(fila)}
                    >
                      <SlidersHorizontal size={16} strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      title="Registrar merma"
                      disabled={fila.cantidad_actual <= 0}
                      onClick={() => onMerma(fila)}
                    >
                      <PackageMinus size={16} strokeWidth={1.75} />
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

export default StockTable;
