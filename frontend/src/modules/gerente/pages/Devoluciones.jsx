import { useState } from "react";
import { confirmar } from "../../../shared/confirm";
import { mensajeApi } from "../../usuarios/rol";
import { anularVenta, fetchVentaPorId } from "../api/gerenteApi";
import DetalleTicket from "../components/DetalleTicket";
import "../gerente.css";

function Devoluciones() {
  const [folio, setFolio] = useState("");
  const [venta, setVenta] = useState(null);
  const [error, setError] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [anulando, setAnulando] = useState(false);

  async function buscar(evento) {
    evento.preventDefault();
    if (!folio.trim()) {
      setError("Escribe el número de ticket.");
      return;
    }
    setBuscando(true);
    setError("");
    setVenta(null);
    try {
      const { data } = await fetchVentaPorId(folio.trim());
      setVenta(data);
    } catch (err) {
      setError(mensajeApi(err, "Ticket no encontrado en tu sucursal."));
    } finally {
      setBuscando(false);
    }
  }

  async function onAnular() {
    if (!venta) return;
    const ok = await confirmar(
      `¿Autorizar devolución y anular la factura #${venta.id_venta}? Se devolverá el stock a tu sucursal.`,
      {
        titulo: "Autorizar devolución",
        aceptar: "Anular factura",
        variante: "peligro",
      },
    );
    if (!ok) return;
    setAnulando(true);
    setError("");
    try {
      const { data } = await anularVenta(venta.id_venta);
      setVenta(data.venta);
    } catch (err) {
      setError(mensajeApi(err, "No se pudo anular la factura."));
    } finally {
      setAnulando(false);
    }
  }

  return (
    <div className="gerente-page">
      <header className="gerente-page-head">
        <div>
          <p className="gerente-eyebrow">Postventa</p>
          <h1>Devoluciones</h1>
        </div>
      </header>
      <form className="page-card d-flex gap-2 flex-wrap" onSubmit={buscar}>
        <input
          className="form-control"
          style={{ maxWidth: 220 }}
          placeholder="Nº de ticket"
          value={folio}
          onChange={(e) => setFolio(e.target.value.replace(/\D/g, ""))}
        />
        <button type="submit" className="btn gerente-btn" disabled={buscando}>
          {buscando ? "Buscando…" : "Buscar ticket"}
        </button>
      </form>
      {error ? <p className="text-danger mt-3">{error}</p> : null}
      <DetalleTicket venta={venta} onAnular={onAnular} anulando={anulando} />
    </div>
  );
}

export default Devoluciones;
