import { useEffect, useState } from "react";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, usePagina } from "../../../shared/paginado";
import { desactivarSucursal, fetchCantones, fetchSucursalDetalle } from "../api/geografiaApi";
import { useSucursales } from "../hooks/useSucursales";
import SucursalDetalleModal from "../components/SucursalDetalleModal";
import SucursalFormModal from "../components/SucursalFormModal";
import SucursalesHeader from "../components/SucursalesHeader";
import SucursalesTable from "../components/SucursalesTable";
import "../sucursales.css";
import "../sucursales-acciones.css";

function SucursalesPage() {
  const [pagina, setPagina] = usePagina();
  const { items, total, error, cargando, recargar } = useSucursales(pagina);
  const [cantones, setCantones] = useState([]);
  const [form, setForm] = useState({ open: false, sucursal: null });
  const [detalle, setDetalle] = useState({ open: false, data: null });

  useEffect(() => {
    fetchCantones()
      .then((response) => setCantones(response.data))
      .catch(() => setCantones([]));
  }, []);

  async function onDesactivar(sucursal) {
    const ok = window.confirm(
      `¿Dar de baja "${sucursal.nombre}"? No se eliminará el historial de ventas ni los cierres de caja.`,
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
            {...datosPaginacion(pagina, total)}
            etiqueta="sucursales"
            onCambio={setPagina}
          />
        </>
      ) : null}
      <SucursalFormModal
        show={form.open}
        sucursal={form.sucursal}
        cantones={cantones}
        onClose={() => setForm({ open: false, sucursal: null })}
        onSaved={() => {
          setForm({ open: false, sucursal: null });
          recargar();
        }}
      />
      <SucursalDetalleModal
        show={detalle.open}
        detalle={detalle.data}
        onClose={() => setDetalle({ open: false, data: null })}
      />
    </div>
  );
}

export default SucursalesPage;
