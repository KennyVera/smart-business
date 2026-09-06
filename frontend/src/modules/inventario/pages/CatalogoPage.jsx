import { Layers, Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import InventarioHeader from "../components/InventarioHeader";
import LoteFormModal from "../components/LoteFormModal";
import ProductoBuscador from "../components/ProductoBuscador";
import ProductoFormModal from "../components/ProductoFormModal";
import ProductoList from "../components/ProductoList";
import { useCategorias, useProductos } from "../hooks/useInventario";
import { useDebounce } from "../hooks/useRecurso";
import { sucursalDeSesion } from "../sucursal";
import "../inventario.css";
import "../inventario-form.css";

function CatalogoPage() {
  const fija = useMemo(() => sucursalDeSesion(), []);
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [form, setForm] = useState({ open: false, producto: null });
  const [lote, setLote] = useState({ open: false, producto: null });
  const [aviso, setAviso] = useState("");
  const buscar = useDebounce(texto, 250);
  const { datos: categorias } = useCategorias();
  const { datos: productos, error, cargando, recargar } = useProductos({
    buscar,
    categoria,
  });

  return (
    <div className="page-card">
      <InventarioHeader
        icon={Package}
        titulo="Catálogo de productos"
        detalle="Maestro de productos con costo, precio y margen calculado al vuelo."
      >
        <div className="inv-filtro-select">
          <Layers size={15} strokeWidth={1.75} />
          <select
            className="form-select"
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((item) => (
              <option key={item.id_categoria} value={item.id_categoria}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn-inv"
          onClick={() => setForm({ open: true, producto: null })}
        >
          <Plus size={16} strokeWidth={2} />
          Nuevo producto
        </button>
      </InventarioHeader>

      <ProductoBuscador valor={texto} total={productos.length} onChange={setTexto} />

      {aviso ? <p className="inv-aviso-ok">{aviso}</p> : null}
      {error ? <p className="text-danger mb-2">{error}</p> : null}
      {cargando ? <p className="text-muted mb-0">Cargando catálogo...</p> : null}
      {!cargando && !error ? (
        <ProductoList
          productos={productos}
          onEditar={(producto) => setForm({ open: true, producto })}
          onLote={(producto) => setLote({ open: true, producto })}
        />
      ) : null}

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
    </div>
  );
}

export default CatalogoPage;
