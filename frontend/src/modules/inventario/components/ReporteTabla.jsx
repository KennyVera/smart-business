import Paginacion from "../../../shared/Paginacion";
import { usePaginacion } from "../../../shared/usePaginacion";
import { alineado, formatearValor } from "../reportes";

function clase(columna) {
  if (columna.tipo === "sku") return "inv-sku";
  if (columna.tipo === "nombre") return "inv-nombre";
  if (alineado(columna.tipo)) {
    return columna.fuerte ? "inv-num inv-num-fuerte" : "inv-num";
  }
  return undefined;
}

function ReporteTabla({ columnas, filas, paraPdf }) {
  const pagina = usePaginacion(filas);

  if (!filas?.length) {
    return (
      <p className="inv-desglose-vacio">
        No hay datos para este reporte con los filtros actuales.
      </p>
    );
  }

  // El PDF es un documento de auditoría: lleva todas las filas, sin paginar.
  const cuerpo = paraPdf ? filas : pagina.visibles;

  const tabla = (
    <table className={paraPdf ? "rep-pdf-tabla" : "table inv-table inv-table-densa align-middle mb-0"}>
      <thead>
        <tr>
          {columnas.map((columna) => (
            <th
              key={columna.clave}
              className={alineado(columna.tipo) ? "text-end" : undefined}
            >
              {columna.etiqueta}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cuerpo.map((fila, indice) => (
          <tr key={`${fila.sku || indice}-${indice}`}>
            {columnas.map((columna) => (
              <td key={columna.clave} className={clase(columna)}>
                {columna.tipo === "chip" && !paraPdf ? (
                  <span className="inv-chip">{fila[columna.clave]}</span>
                ) : (
                  formatearValor(fila[columna.clave], columna.tipo)
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (paraPdf) return tabla;

  return (
    <>
      <div className="table-responsive inv-wrap rep-tabla-wrap">{tabla}</div>
      <Paginacion {...pagina} etiqueta="registros" onCambio={pagina.irA} />
    </>
  );
}

export default ReporteTabla;
