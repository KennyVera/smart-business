import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { useFilasPorPagina } from "../../../context/PreferencesContext";
import Paginacion from "../../../shared/Paginacion";
import { useDatosPaginacion, leerPagina, usePagina } from "../../../shared/paginado";
import { fetchKardex } from "../api/inventarioApi";
import { formatearDinero } from "../margen";
import KardexMovimientos from "./KardexMovimientos";

const VACIO = { stock_actual: 0, stock_por_sucursal: [], movimientos: null };

function KardexOffcanvas({ show, producto, sucursal, onClose }) {
  const pageSize = useFilasPorPagina();
  const [datos, setDatos] = useState(VACIO);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = usePagina(`${producto?.id_producto}|${sucursal?.id}`);

  useEffect(() => {
    if (!show || !producto) return;
    setCargando(true);
    setError("");
    fetchKardex(producto.id_producto, {
      sucursal: sucursal?.id,
      page: pagina,
      page_size: pageSize,
    })
      .then((response) => setDatos(response.data))
      .catch(() => setError("No se pudo cargar el kardex del producto."))
      .finally(() => setCargando(false));
  }, [show, producto, sucursal, pagina, pageSize]);

  const movimientos = leerPagina(datos.movimientos);
  const paginacionUi = useDatosPaginacion(pagina, movimientos.total);

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" className="inv-kardex">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="inv-form-title">
          <ClipboardList size={18} />
          Kardex de {producto?.nombre}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="inv-kardex-resumen">
          <div>
            <span>Stock actual</span>
            <strong>{datos.stock_actual}</strong>
            <small>{sucursal ? sucursal.nombre : "Todas las sucursales"}</small>
          </div>
          <dl>
            <dt>SKU</dt>
            <dd className="inv-sku">{producto?.sku}</dd>
            <dt>Precio</dt>
            <dd>{formatearDinero(producto?.precio_venta)}</dd>
          </dl>
        </div>

        {error ? <p className="text-danger">{error}</p> : null}
        {cargando ? <p className="text-muted mb-0">Cargando movimientos...</p> : null}
        {!cargando && !error ? (
          <>
            <h4 className="inv-kardex-titulo">Historial de movimientos</h4>
            <KardexMovimientos movimientos={movimientos.items} />
            <Paginacion
              {...paginacionUi}
              etiqueta="movimientos"
              compacta
              onCambio={setPagina}
            />
          </>
        ) : null}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default KardexOffcanvas;
