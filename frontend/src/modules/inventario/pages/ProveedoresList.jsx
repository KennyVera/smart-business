import { Plus, Truck } from "lucide-react";
import { useState } from "react";
import Paginacion from "../../../shared/Paginacion";
import { useDatosPaginacion, usePagina } from "../../../shared/paginado";
import InventarioHeader from "../components/InventarioHeader";
import ProveedorFormModal from "../components/ProveedorFormModal";
import ProveedoresTable from "../components/ProveedoresTable";
import { useProveedores } from "../hooks/useInventario";
import "../inventario.css";
import "../inventario-form.css";

function ProveedoresList() {
  const [pagina, setPagina] = usePagina();
  const { items: proveedores, total, error, cargando, recargar } = useProveedores(pagina);
  const [form, setForm] = useState({ open: false, proveedor: null });
  const paginacionUi = useDatosPaginacion(pagina, total);

  return (
    <div className="page-card">
      <InventarioHeader
        icon={Truck}
        titulo="Proveedores"
        detalle="Maestro de proveedores para el catálogo y contacto rápido desde el kardex."
      >
        <button
          type="button"
          className="btn-inv"
          onClick={() => setForm({ open: true, proveedor: null })}
        >
          <Plus size={16} strokeWidth={2} />
          Nuevo proveedor
        </button>
      </InventarioHeader>

      {error ? <p className="text-danger mb-2">{error}</p> : null}
      {cargando ? <p className="text-muted mb-0">Cargando proveedores...</p> : null}
      {!cargando && !error ? (
        <>
          <ProveedoresTable
            proveedores={proveedores}
            onEditar={(proveedor) => setForm({ open: true, proveedor })}
          />
          <Paginacion
            {...paginacionUi}
            etiqueta="proveedores"
            onCambio={setPagina}
          />
        </>
      ) : null}

      <ProveedorFormModal
        show={form.open}
        proveedor={form.proveedor}
        onClose={() => setForm({ open: false, proveedor: null })}
        onSaved={() => {
          setForm({ open: false, proveedor: null });
          recargar();
        }}
      />
    </div>
  );
}

export default ProveedoresList;
