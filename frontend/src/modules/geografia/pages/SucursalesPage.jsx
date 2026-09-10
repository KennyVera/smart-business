import { useEffect, useState } from "react";
import Paginacion from "../../../shared/Paginacion";
import { confirmar } from "../../../shared/confirm";
import { useDatosPaginacion, usePagina } from "../../../shared/paginado";
import { desactivarSucursal, fetchProvincias, fetchSucursalDetalle } from "../api/geografiaApi";
import { useSucursales } from "../hooks/useSucursales";
import SucursalDetalleOffcanvas from "../components/SucursalDetalleOffcanvas";
import SucursalFormModal from "../components/SucursalFormModal";
import SucursalesHeader from "../components/SucursalesHeader";
import SucursalesTable from "../components/SucursalesTable";
import "../sucursales.css";
import "../sucursales-acciones.css";

function SucursalesPage() {
  const [pagina, setPagina] = usePagina();
  const { items, total, error, cargando, recargar } = useSucursales(pagina);
  const paginacionUi = useDatosPaginacion(pagina, total);
  const [provincias, setProvincias] = useState([]);
  const [form, setForm] = useState({ open: false, sucursal: null });
  const [detalle, setDetalle] = useState({ open: false, data: null });

  useEffect(() => {
    fetchProvincias()
      .then((response) => setProvincias(response.data))
      .catch(() => setProvincias([]));
  }, []);

  async function onDesactivar(sucursal) {
    const ok = await confirmar(
      `¿Dar de baja "${sucursal.nombre}"? No se eliminará el historial de ventas ni los cierres de caja.`,
      {
        titulo: "Dar de baja sucursal",
        aceptar: "Dar de baja",
        variante: "peligro",
      },
    );
    if (!ok) return;
    await desactivarSucursal(sucursal.id_nombre);
    recargar();
  }

  async function onDetalle(sucursal) {
    setDetalle({ open: true, data: null });
    const { data } = await fetchSucursalDetalle(sucursal.id_nombre);
    setDetalle({ open: true, data });
  }

  return (
    <div className="page-card">
      <SucursalesHeader onNueva={() => setForm({ open: true, sucursal: null })} />
      {cargando ? <p className="text-muted mb-0">Cargando sucursales...</p> : null}
      {error ? <p className="text-danger mb-0">{error}</p> : null}
      {!cargando && !error ? (
        <>
          <SucursalesTable
            sucursales={items}
            onEditar={(item) => setForm({ open: true, sucursal: item })}
            onDesactivar={onDesactivar}
            onDetalle={onDetalle}
          />
          <Paginacion
            {...paginacionUi}
            etiqueta="sucursales"
            onCambio={setPagina}
          />
        </>
      ) : null}
      <SucursalFormModal
        show={form.open}
        sucursal={form.sucursal}
        provincias={provincias}
        onClose={() => setForm({ open: false, sucursal: null })}
        onSaved={() => {
          setForm({ open: false, sucursal: null });
          recargar();
        }}
      />
      <SucursalDetalleOffcanvas
        show={detalle.open}
        detalle={detalle.data}
        onClose={() => setDetalle({ open: false, data: null })}
      />
    </div>
  );
}

export default SucursalesPage;
