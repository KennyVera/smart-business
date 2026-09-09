import { ArrowRight, CreditCard, Receipt, ScanLine } from "lucide-react";
import { dinero, numero, redondear } from "../dinero";
import ClienteBuscador from "./ClienteBuscador";
import MetodosPago, { esEfectivo } from "./MetodosPago";
import TicketLinea from "./TicketLinea";

const SOLO_MONTO = /[^\d.]/g;

function TicketVenta({
  carrito,
  turno,
  cliente,
  pago,
  procesando,
  error,
  onCliente,
  onFinalizar,
  crmKey,
}) {
  const { items, total, unidades, subtotalIva15, subtotalIva0, montoIva } = carrito;
  const conEfectivo = esEfectivo(pago.seleccion);
  const recibido = redondear(numero(pago.recibido));
  const cambio = redondear(recibido - total);
  const faltaEfectivo = conEfectivo && (pago.recibido === "" || recibido < total);
  const listo =
    items.length > 0 &&
    Boolean(pago.seleccion) &&
    Boolean(turno) &&
    !faltaEfectivo;

  return (
    <section className="pos-ticket">
      <header className="pos-ticket-cabecera">
        <h2>
          <Receipt size={18} strokeWidth={1.75} />
          Resumen de venta
        </h2>
        <span>{turno ? `#${String(turno.id_turno).padStart(6, "0")}` : "Sin turno"}</span>
      </header>

      {items.length === 0 ? (
        <p className="pos-ticket-vacio">
          <ScanLine size={22} strokeWidth={1.5} />
          Escanea un código o toca un producto para empezar la venta.
        </p>
      ) : (
        <div className="pos-ticket-tabla">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-center">Cant.</th>
                <th className="text-end">P. Unit.</th>
                <th className="text-end">Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <TicketLinea
                  key={item.id_producto}
                  item={item}
                  onCantidad={carrito.fijarCantidad}
                  onQuitar={carrito.quitar}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {carrito.aviso ? <p className="pos-aviso">{carrito.aviso}</p> : null}

      <div className="pos-iva">
        <div>
          <span>Subtotal 15%</span>
          <strong>{dinero(subtotalIva15)}</strong>
        </div>
        <div>
          <span>Subtotal 0%</span>
          <strong>{dinero(subtotalIva0)}</strong>
        </div>
        <div>
          <span>IVA 15%</span>
          <strong>{dinero(montoIva)}</strong>
        </div>
      </div>

      <div className="pos-total">
        <div>
          <span>Total</span>
          <small>
            {unidades} {unidades === 1 ? "artículo" : "artículos"}
          </small>
        </div>
        <strong className="fw-bold fs-1">{dinero(total)}</strong>
      </div>

      <ClienteBuscador key={crmKey} cliente={cliente} onCliente={onCliente} />

      <MetodosPago
        metodos={pago.metodos}
        seleccion={pago.seleccion}
        onSeleccion={pago.onSeleccion}
      />

      <div className="pos-efectivo">
        <label>
          <span className="pos-etiqueta">Recibido</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder={
              conEfectivo
                ? "Monto entregado por el cliente"
                : "Igual al total de la venta"
            }
            value={pago.recibido}
            disabled={!conEfectivo}
            onChange={(evento) =>
              pago.onRecibido(evento.target.value.replace(SOLO_MONTO, "").slice(0, 9))
            }
          />
        </label>
        <p className={`pos-cambio-entregar${faltaEfectivo ? " is-falta" : ""}`}>
          {faltaEfectivo && pago.recibido !== ""
            ? `Falta ${dinero(Math.abs(cambio))} para completar el total`
            : `Cambio a entregar: ${dinero(Math.max(cambio, 0))}`}
        </p>
      </div>

      {error ? <p className="pos-error">{error}</p> : null}

      <button
        type="button"
        className="pos-btn-finalizar"
        disabled={!listo || procesando}
        onClick={onFinalizar}
      >
        {procesando ? "Procesando..." : "Finalizar venta"}
        {procesando ? null : (
          <>
            <CreditCard size={18} strokeWidth={2} />
            <ArrowRight size={20} strokeWidth={2.25} />
          </>
        )}
      </button>
      {!turno ? (
        <small className="pos-nota">Abre un turno de caja para poder cobrar.</small>
      ) : null}
      {turno && items.length > 0 && !pago.seleccion ? (
        <small className="pos-nota">Elige el método de pago para cobrar.</small>
      ) : null}
      {turno && items.length > 0 && faltaEfectivo ? (
        <small className="pos-nota">
          El efectivo recibido debe cubrir el total para cobrar.
        </small>
      ) : null}
    </section>
  );
}

export default TicketVenta;
