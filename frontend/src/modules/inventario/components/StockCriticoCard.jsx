import { PackageMinus, ShieldAlert } from "lucide-react";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion } from "../../../shared/paginado";
import { nivelStock } from "../margen";

function StockCriticoCard({ filas, total, pagina, mostrarSucursal, onPagina, onMerma }) {
  return (
    <section className="inv-card">
      <header className="inv-card-head">
        <h3>
          <ShieldAlert size={17} strokeWidth={1.75} />
          Stock crítico
        </h3>
        <span className="inv-card-total is-critico">{total}</span>
      </header>
      <p className="inv-card-detalle">
        Productos en o por debajo del mínimo definido para la sucursal.
      </p>
      {total === 0 ? (
        <p className="text-muted mb-0">Todo el inventario está sobre el mínimo.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table inv-table inv-table-densa align-middle mb-0">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  {mostrarSucursal ? <th>Sucursal</th> : null}
                  <th className="text-end">Actual</th>
                  <th className="text-end">Mínimo</th>
                  <th className="text-end">Faltan</th>
                  <th className="text-end">Merma</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr
                    key={`${fila.id_sucursal}-${fila.id_producto}`}
                    className={`inv-row is-${nivelStock(fila)}`}
                  >
                    <td className="inv-sku">{fila.sku}</td>
                    <td className="inv-nombre">{fila.producto_nombre}</td>
                    {mostrarSucursal ? (
                      <td className="text-muted">{fila.sucursal_nombre}</td>
                    ) : null}
                    <td className="inv-num inv-num-fuerte">{fila.cantidad_actual}</td>
                    <td className="inv-num text-muted">{fila.stock_minimo}</td>
                    <td className="inv-num">{fila.faltante}</td>
                    <td>
                      <div className="inv-acciones">
                        <button
                          type="button"
                          title="Registrar merma"
                          disabled={fila.cantidad_actual <= 0}
                          onClick={() => onMerma(fila)}
                        >
                          <PackageMinus size={15} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion
            {...datosPaginacion(pagina, total)}
            etiqueta="productos"
            compacta
            onCambio={onPagina}
          />
        </>
      )}
    </section>
  );
}

export default StockCriticoCard;
