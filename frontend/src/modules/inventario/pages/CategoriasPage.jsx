import { Plus, Tags } from "lucide-react";
import { useState } from "react";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, usePagina } from "../../../shared/paginado";
import CategoriaFormModal from "../components/CategoriaFormModal";
import CategoriasTable from "../components/CategoriasTable";
import InventarioHeader from "../components/InventarioHeader";
import { useCategorias } from "../hooks/useInventario";
import "../inventario.css";
import "../inventario-form.css";

function CategoriasPage() {
  const [pagina, setPagina] = usePagina();
  const { items: categorias, total, error, cargando, recargar } = useCategorias(pagina);
  const [form, setForm] = useState({ open: false, categoria: null });

  return (
    <div className="page-card">
      <InventarioHeader
        icon={Tags}
        titulo="Categorías"
        detalle="Agrupan el catálogo para filtrar y analizar el margen por familia."
      >
        <button
          type="button"
          className="btn-inv"
          onClick={() => setForm({ open: true, categoria: null })}
        >
          <Plus size={16} strokeWidth={2} />
          Nueva categoría
        </button>
      </InventarioHeader>

      {error ? <p className="text-danger mb-2">{error}</p> : null}
      {cargando ? <p className="text-muted mb-0">Cargando categorías...</p> : null}
      {!cargando && !error ? (
        <>
          <CategoriasTable
            categorias={categorias}
            onEditar={(categoria) => setForm({ open: true, categoria })}
          />
          <Paginacion
            {...datosPaginacion(pagina, total)}
            etiqueta="categorías"
            onCambio={setPagina}
          />
        </>
      ) : null}

      <CategoriaFormModal
        show={form.open}
        categoria={form.categoria}
        onClose={() => setForm({ open: false, categoria: null })}
        onSaved={() => {
          setForm({ open: false, categoria: null });
          recargar();
        }}
      />
    </div>
  );
}

export default CategoriasPage;
