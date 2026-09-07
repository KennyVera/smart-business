import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Paginacion from "../../../shared/Paginacion";
import { leerPagina } from "../../../shared/paginado";
import { usePaginacion } from "../../../shared/usePaginacion";
import { createProducto, fetchProductos, updateProducto } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { leerProductosCsv } from "../csv";
import { validarProducto } from "../validacion";

const PLANTILLA = "sku,nombre,categoria,costo_actual,precio_venta";

function prepararFila(fila, categorias) {
  const sku = (fila.sku || "").trim().toUpperCase();
  const categoria = categorias.find(
    (item) => item.nombre.toLowerCase() === (fila.categoria || "").trim().toLowerCase(),
  );
  if (!categoria) {
    return { sku, error: `Categoría "${fila.categoria || "vacía"}" no existe.` };
  }
  const form = {
    sku,
    nombre: (fila.nombre || "").trim(),
    categoria: String(categoria.id_categoria),
    costo_actual: (fila.costo_actual || "").replace(",", "."),
    precio_venta: (fila.precio_venta || "").replace(",", "."),
  };
  const aviso = validarProducto(form);
  if (aviso) return { sku, error: aviso };
  return {
    sku,
    payload: {
      sku,
      nombre: form.nombre,
      categoria: categoria.id_categoria,
      costo_actual: Number(form.costo_actual).toFixed(2),
      precio_venta: Number(form.precio_venta).toFixed(2),
    },
  };
}

/** El catálogo puede ser enorme: se consulta el SKU justo antes de guardarlo. */
async function buscarPorSku(sku) {
  const { data } = await fetchProductos({ sku, page_size: 5 });
  const { items } = leerPagina(data);
  return items.find((item) => item.sku.toUpperCase() === sku) || null;
}

function ImportarCsvModal({ show, categorias, onClose, onImportado }) {
  const [filas, setFilas] = useState([]);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!show) return;
    setFilas([]);
    setError("");
    setResultado(null);
  }, [show]);

  async function onArchivo(event) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    setError("");
    setResultado(null);
    try {
      const texto = await archivo.text();
      const leidas = leerProductosCsv(texto);
      if (leidas.length === 0) {
        setError(`El archivo está vacío o no tiene la cabecera: ${PLANTILLA}`);
        return;
      }
      setFilas(leidas.map((fila) => prepararFila(fila, categorias)));
    } catch {
      setError("No se pudo leer el archivo.");
    }
  }

  async function onImportar() {
    setProcesando(true);
    const resumen = { creados: 0, actualizados: 0, fallidos: [] };
    for (const fila of filas) {
      if (fila.error) {
        resumen.fallidos.push(`${fila.sku || "(sin SKU)"}: ${fila.error}`);
        continue;
      }
      try {
        const existente = await buscarPorSku(fila.sku);
        if (existente) {
          await updateProducto(existente.id_producto, fila.payload);
          resumen.actualizados += 1;
        } else {
          await createProducto(fila.payload);
          resumen.creados += 1;
        }
      } catch (err) {
        resumen.fallidos.push(`${fila.sku}: ${mensajeApi(err, "no se pudo guardar")}`);
      }
    }
    setProcesando(false);
    setResultado(resumen);
    onImportado();
  }

  const validas = filas.filter((fila) => !fila.error).length;
  const previa = usePaginacion(filas);
  const fallos = usePaginacion(resultado?.fallidos || []);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="inv-glass-backdrop"
      dialogClassName="inv-form-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title className="inv-form-title">
          <Upload size={18} />
          Importar productos desde CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="inv-nota mt-0">
          Cabecera esperada: <code>{PLANTILLA}</code>. Los SKU que ya existen se
          actualizan y la categoría debe estar creada.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="form-control"
          onChange={onArchivo}
        />
        {error ? <p className="text-danger mt-3 mb-0">{error}</p> : null}

        {filas.length > 0 && !resultado ? (
          <div className="inv-import-previa">
            <p>
              {filas.length} filas leídas · <strong>{validas}</strong> listas para
              importar
            </p>
            <ul>
              {previa.visibles.map((fila, indice) => (
                <li key={`${fila.sku}-${indice}`} className={fila.error ? "is-error" : ""}>
                  <span className="inv-sku">{fila.sku || "(sin SKU)"}</span>
                  {fila.error ? ` · ${fila.error}` : " · lista"}
                </li>
              ))}
            </ul>
            <Paginacion {...previa} etiqueta="filas" compacta onCambio={previa.irA} />
          </div>
        ) : null}

        {resultado ? (
          <div className="inv-import-previa">
            <p>
              {resultado.creados} creados · {resultado.actualizados} actualizados ·{" "}
              {resultado.fallidos.length} con error
            </p>
            <ul>
              {fallos.visibles.map((fallo) => (
                <li key={fallo} className="is-error">
                  {fallo}
                </li>
              ))}
            </ul>
            <Paginacion {...fallos} etiqueta="errores" compacta onCambio={fallos.irA} />
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-light" onClick={onClose}>
          Cerrar
        </button>
        <button
          type="button"
          className="btn-inv"
          disabled={validas === 0 || procesando || Boolean(resultado)}
          onClick={onImportar}
        >
          {procesando ? "Importando..." : `Importar ${validas} productos`}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportarCsvModal;
