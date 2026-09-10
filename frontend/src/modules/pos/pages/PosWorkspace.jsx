import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, leerPagina, usePagina } from "../../../shared/paginado";
import { useDebounce } from "../../../shared/useRecurso";
import { mensajeApi } from "../../usuarios/rol";
import { fetchCatalogoGlobal, procesarVenta } from "../api/posApi";
import BuscadorProducto from "../components/BuscadorProducto";
import CategoriaPills from "../components/CategoriaPills";
import { esEfectivo } from "../components/MetodosPago";
import ProductoGrid from "../components/ProductoGrid";
import TicketVenta from "../components/TicketVenta";
import VentaFinalizadaModal from "../components/VentaFinalizadaModal";
import { numero, textoMonto } from "../dinero";
import { useCart } from "../hooks/useCart";
import { useEscanerFoco } from "../hooks/useEscanerFoco";
import {
  POR_PAGINA_POS,
  useCatalogoPos,
  useCategoriasPos,
  useMetodosPago,
} from "../hooks/usePos";

function PosWorkspace() {
  const { turno, aplicarTurno } = useOutletContext();
  const carrito = useCart();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cliente, setCliente] = useState(null);
  const [crmKey, setCrmKey] = useState(0);
  const [metodo, setMetodo] = useState(null);
  const [recibido, setRecibido] = useState("");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [comprobante, setComprobante] = useState(null);

  const buscar = useDebounce(texto, 250);
  const [pagina, setPagina] = usePagina(`${buscar}|${categoria}|${turno?.id_turno || 0}`);
  const catalogo = useCatalogoPos({
    buscar,
    categoria,
    pagina,
    turnoId: turno?.id_turno,
  });
  const { datos: categorias } = useCategoriasPos(turno?.id_turno);
  const { datos: metodos } = useMetodosPago();
  const { ref, enfocar } = useEscanerFoco(!comprobante);

  useEffect(() => {
    if (metodo || metodos.length === 0) return;
    setMetodo(metodos.find(esEfectivo) || metodos[0]);
  }, [metodo, metodos]);

  useEffect(() => {
    if (!metodo || esEfectivo(metodo)) return;
    setRecibido(textoMonto(carrito.total));
  }, [metodo, carrito.total]);

  function elegirMetodo(siguiente) {
    setMetodo(siguiente);
    if (esEfectivo(siguiente)) {
      setRecibido("");
      return;
    }
    setRecibido(textoMonto(carrito.total));
  }

  function agregar(fila) {
    carrito.agregar(fila);
    enfocar();
  }

  /** Pistola / Enter: busca en el catálogo global (cualquier sucursal). */
  async function buscarYAgregar(valor) {
    const consulta = valor.trim();
    if (!consulta) return;
    try {
      const { data } = await fetchCatalogoGlobal({
        buscar: consulta,
        page_size: 5,
      });
      const encontrados = leerPagina(data).items;
      const exacto =
        encontrados.find(
          (fila) => fila.sku.toLowerCase() === consulta.toLowerCase(),
        ) || (encontrados.length === 1 ? encontrados[0] : null);
      if (!exacto) {
        carrito.setAviso(
          encontrados.length === 0
            ? `Producto no encontrado: "${consulta}".`
            : "Varios productos coinciden: elige uno de la grilla o escanea el SKU exacto.",
        );
        return;
      }
      carrito.agregar(exacto);
      setTexto("");
      enfocar();
    } catch {
      carrito.setAviso("No se pudo consultar el catálogo global.");
    }
  }

  async function finalizar() {
    setProcesando(true);
    setError("");
    try {
      const { data } = await procesarVenta({
        items: carrito.items.map((item) => ({
          producto: item.id_producto,
          cantidad: item.cantidad,
        })),
        metodo_pago: metodo.id_metodo_pago,
        cliente: cliente?.id_cliente ?? null,
        monto_recibido: esEfectivo(metodo)
          ? textoMonto(recibido)
          : textoMonto(carrito.total),
        cambio: esEfectivo(metodo)
          ? textoMonto(numero(recibido) - carrito.total)
          : textoMonto(0),
      });
      setComprobante(data);
      carrito.limpiar();
      setCliente(null);
      setRecibido("");
      setCrmKey((n) => n + 1);
      aplicarTurno({ resumen: data.resumen });
      catalogo.recargar();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo procesar la venta."));
    } finally {
      setProcesando(false);
    }
  }

  function nuevaVenta() {
    setComprobante(null);
    setCliente(null);
    setRecibido("");
    setTexto("");
    setCategoria("");
    setCrmKey((n) => n + 1);
    enfocar();
  }

  return (
    <div className="row g-3 pos-workspace">
      <div className="col-12 col-xl-8">
        <section className="pos-panel">
          <h2 className="pos-panel-titulo">Buscar producto</h2>
          <BuscadorProducto
            valor={texto}
            inputRef={ref}
            onValor={setTexto}
            onBuscar={buscarYAgregar}
          />
          <CategoriaPills
            categorias={categorias}
            activa={categoria}
            onCambio={setCategoria}
          />
          {catalogo.error ? <p className="pos-error">{catalogo.error}</p> : null}
          <ProductoGrid
            filas={catalogo.items}
            cargando={catalogo.cargando}
            onAgregar={agregar}
          />
          <Paginacion
            {...datosPaginacion(pagina, catalogo.total, POR_PAGINA_POS)}
            etiqueta="productos"
            onCambio={setPagina}
          />
        </section>
      </div>

      <div className="col-12 col-xl-4">
        <TicketVenta
          carrito={carrito}
          turno={turno}
          cliente={cliente}
          pago={{
            metodos,
            seleccion: metodo,
            onSeleccion: elegirMetodo,
            recibido,
            onRecibido: setRecibido,
          }}
          procesando={procesando}
          error={error}
          onCliente={setCliente}
          onFinalizar={finalizar}
          crmKey={crmKey}
        />
      </div>

      <VentaFinalizadaModal
        show={Boolean(comprobante)}
        comprobante={comprobante}
        onNuevaVenta={nuevaVenta}
      />
    </div>
  );
}

export default PosWorkspace;
