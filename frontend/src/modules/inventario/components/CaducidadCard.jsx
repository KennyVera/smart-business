import { CalendarClock } from "lucide-react";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion } from "../../../shared/paginado";
import { nivelCaducidad, textoCaducidad } from "../margen";

function fecha(valor) {
  const [anio, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${anio}`;
}

function CaducidadCard({ lotes, total, pagina, dias, mostrarSucursal, onPagina }) {
  return (
    <section className="inv-card">
      <header className="inv-card-head">
        <h3>
          <CalendarClock size={17} strokeWidth={1.75} />
          Próximos a caducar
        </h3>
        <span className="inv-card-total is-bajo">{total}</span>
      </header>
      <p className="inv-card-detalle">
        Lotes con vencimiento dentro de los próximos {dias} días, del más urgente al
        menos urgente.
      </p>
      {total === 0 ? (
        <p className="text-muted mb-0">Ningún lote vence en esa ventana de tiempo.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table inv-table inv-table-densa align-middle mb-0">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Lote</th>
                  {mostrarSucursal ? <th>Sucursal</th> : null}
                  <th>Vence</th>
                  <th className="text-end">Unidades</th>
                  <th className="text-end">Aviso</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((lote) => {
                  const nivel = nivelCaducidad(lote.dias_para_vencer);
                  return (
                    <tr key={lote.id_lote} className={`inv-row is-${nivel}`}>
                      <td className="inv-nombre">{lote.producto_nombre}</td>
                      <td className="inv-sku">{lote.codigo_lote}</td>
                      {mostrarSucursal ? (
                        <td className="text-muted">{lote.sucursal_nombre}</td>
                      ) : null}
                      <td>{fecha(lote.fecha_vencimiento)}</td>
                      <td className="inv-num inv-num-fuerte">{lote.cantidad}</td>
                      <td className="text-end">
                        <span className={`inv-estado is-${nivel}`}>
                          {textoCaducidad(lote.dias_para_vencer)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Paginacion
            {...datosPaginacion(pagina, total)}
            etiqueta="lotes"
            compacta
            onCambio={onPagina}
          />
        </>
      )}
    </section>
  );
}

export default CaducidadCard;
