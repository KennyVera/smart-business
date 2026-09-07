import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, leerPagina, TODOS, usePagina } from "../../../shared/paginado";
import { fetchProductos } from "../api/inventarioApi";
import CatalogoFiltros from "../components/CatalogoFiltros";
import ImportarCsvModal from "../components/ImportarCsvModal";
import InventarioHeader from "../components/InventarioHeader";
import KardexOffcanvas from "../components/KardexOffcanvas";
import LoteFormModal from "../components/LoteFormModal";
import ProductoBuscador from "../components/ProductoBuscador";
import ProductoFormModal from "../components/ProductoFormModal";
import ProductoList from "../components/ProductoList";
import SeleccionBarra from "../components/SeleccionBarra";
import { exportarProductosCsv } from "../csv";
import { imprimirEtiquetas } from "../etiquetas";
import { useCategoriasTodas, useProductos } from "../hooks/useInventario";
import { useDebounce } from "../hooks/useRecurso";
import { sucursalDeSesion } from "../sucursal";
import "../inventario.css";
import "../inventario-form.css";

function CatalogoPage() {
  const fija = useMemo(() => sucursalDeSesion(), []);
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [margen, setMargen] = useState("");
  const [seleccion, setSeleccion] = useState(() => new Set());
  const [form, setForm] = useState({ open: false, producto: null });
  const [lote, setLote] = useState({ open: false, producto: null });
  const [kardex, setKardex] = useState({ open: false, producto: null });
  const [importar, setImportar] = useState(false);
  const [aviso, setAviso] = useState("");
  const buscar = useDebounce(texto, 250);
  const [pagina, setPagina] = usePagina(`${buscar}|${categoria}|${margen}`);
  const { datos: categorias } = useCategoriasTodas();
  const { items: productos, total, error, cargando, recargar } = useProductos({
    buscar,
    categoria,
    margen,
    pagina,
  });

  const marcados = productos.filter((producto) => seleccion.has(producto.id_producto));

  function alternar(id) {
    setSeleccion((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  function alternarTodos(marcar) {
    setSeleccion((actual) => {
      const siguiente = new Set(actual);
      productos.forEach((producto) => {
        if (marcar) siguiente.add(producto.id_producto);
        else siguiente.delete(producto.id_producto);
      });
      return siguiente;
    });
  }

  function onImprimir() {
    const abierto = imprimirEtiquetas(marcados);
    if (!abierto) {
      setAviso("El navegador bloqueó la ventana de impresión; permite las ventanas emergentes.");
    }
  }

  async function onExportar() {
    const { data } = await fetchProductos({
      buscar: buscar || undefined,
      categoria: categoria || undefined,
      margen: margen || undefined,
      page_size: TODOS,
    });
    const { items, total: encontrados } = leerPagina(data);
    exportarProductosCsv(items);
    setAviso(
      encontrados > items.length
        ? `Se exportaron ${items.length} de ${encontrados} productos; afina los filtros para bajar el resto.`
        : `Se exportaron ${items.length} productos.`,
    );
  }

  return (
    <div className="page-card">
      <InventarioHeader
        icon={Package}
        titulo="Catálogo de productos"
        detalle="Maestro de productos con costo, precio y margen calculado al vuelo."
      >
        <CatalogoFiltros
          categorias={categorias}
          categoria={categoria}
          margen={margen}
          onCategoria={setCategoria}
          onMargen={setMargen}
          onExportar={onExportar}
          onImportar={() => setImportar(true)}
          onNuevo={() => setForm({ open: true, producto: null })}
        />
      </InventarioHeader>

      <ProductoBuscador valor={texto} total={total} onChange={setTexto} />

      {aviso ? <p className="inv-aviso-ok">{aviso}</p> : null}
      {error ? <p className="text-danger mb-2">{error}</p> : null}
      {cargando ? <p className="text-muted mb-0">Cargando catálogo...</p> : null}
      {!cargando && !error ? (
        <>
          <ProductoList
            productos={productos}
            seleccion={seleccion}
            onSeleccion={alternar}
            onSeleccionTodos={alternarTodos}
            onEditar={(producto) => setForm({ open: true, producto })}
            onLote={(producto) => setLote({ open: true, producto })}
            onKardex={(producto) => setKardex({ open: true, producto })}
          />
          <Paginacion
            {...datosPaginacion(pagina, total)}
            etiqueta="productos"
            onCambio={setPagina}
          />
        </>
      ) : null}

      <SeleccionBarra
        total={marcados.length}
        onImprimir={onImprimir}
        onLimpiar={() => setSeleccion(new Set())}
      />

      <ProductoFormModal
        show={form.open}
        producto={form.producto}
        categorias={categorias}
        onClose={() => setForm({ open: false, producto: null })}
        onSaved={() => {
          setForm({ open: false, producto: null });
          setAviso("Producto guardado.");
          recargar();
        }}
      />
      <LoteFormModal
        show={lote.open}
        producto={lote.producto}
        sucursal={fija}
        onClose={() => setLote({ open: false, producto: null })}
        onSaved={() => {
          setAviso(`Lote registrado para ${lote.producto?.nombre}.`);
          setLote({ open: false, producto: null });
        }}
      />
      <ImportarCsvModal
        show={importar}
        categorias={categorias}
        onClose={() => setImportar(false)}
        onImportado={recargar}
      />
      <KardexOffcanvas
        show={kardex.open}
        producto={kardex.producto}
        sucursal={fija}
        onClose={() => setKardex({ open: false, producto: null })}
      />
    </div>
  );
}

export default CatalogoPage;
