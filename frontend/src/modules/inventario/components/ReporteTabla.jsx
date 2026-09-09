import { usePreferences } from "../../../context/PreferencesContext";
import Paginacion from "../../../shared/Paginacion";
import { usePaginacion } from "../../../shared/usePaginacion";
import { ACENTO_DEF } from "../coloresReporte";
import { alineado, formatearValor } from "../reportes";

function clase(columna) {
  if (columna.tipo === "sku") return "inv-sku";
  if (columna.tipo === "nombre") return "inv-nombre";
  if (columna.tipo === "truncado") return "rep-celda-truncada";
  if (alineado(columna.tipo)) {
    return columna.fuerte ? "inv-num inv-num-fuerte" : "inv-num";
  }
  return undefined;
}

function Celda({ columna, valor, paraPdf }) {
  const texto = formatearValor(valor, columna.tipo === "truncado" ? undefined : columna.tipo);
  if (columna.tipo === "chip" && !paraPdf) {
    return <span className="inv-chip">{texto}</span>;
  }
  if (columna.tipo === "truncado") {
    if (paraPdf) return texto;
    return (
      <span
        className="text-truncate d-inline-block rep-truncado"
        title={texto === "—" ? undefined : texto}
      >
        {texto}
      </span>
    );
  }
  return texto;
}

function ReporteTabla({ columnas, filas, paraPdf, colorAcento }) {
  const { colorGraficos } = usePreferences();
  const acento = colorAcento || colorGraficos || ACENTO_DEF;
  const pagina = usePaginacion(filas);

  if (!filas?.length) {
    return (
      <p className="inv-desglose-vacio">
        No hay datos para este reporte con los filtros actuales.
      </p>
    );
  }

  const cuerpo = paraPdf ? filas : pagina.visibles;
  const estiloCabecera = paraPdf ? { background: acento, color: "#fff" } : undefined;

  const tabla = (
    <table className={paraPdf ? "rep-pdf-tabla" : "table inv-table inv-table-densa align-middle mb-0"}>
      <thead>
        <tr>
          {columnas.map((columna) => (
            <th
              key={columna.clave}
              className={alineado(columna.tipo) ? "text-end" : undefined}
              style={{
                ...estiloCabecera,
                ...(paraPdf && columna.pdfAncho ? { width: columna.pdfAncho } : undefined),
              }}
            >
              {columna.etiqueta}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cuerpo.map((fila, indice) => (
          <tr key={`${fila.sku || fila.cedula || indice}-${indice}`}>
            {columnas.map((columna) => (
              <td
                key={columna.clave}
                className={clase(columna)}
                style={
                  paraPdf && columna.pdfAncho ? { width: columna.pdfAncho } : undefined
                }
                title={
                  columna.tipo === "truncado" && fila[columna.clave]
                    ? String(fila[columna.clave])
                    : undefined
                }
              >
                <Celda columna={columna} valor={fila[columna.clave]} paraPdf={paraPdf} />
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
