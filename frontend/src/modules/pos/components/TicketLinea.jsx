import { AlertTriangle, Package, Trash2 } from "lucide-react";
import { CANTIDAD_MAXIMA } from "../hooks/useCart";
import { dinero } from "../dinero";
import CantidadRapida from "./CantidadRapida";

function TicketLinea({ item, onCantidad, onQuitar }) {
  const alerta = item.stock_alerta || item.disponible <= 0;
  const maximo = alerta ? CANTIDAD_MAXIMA : item.disponible;

  return (
    <tr className={alerta ? "pos-ticket-alerta" : undefined}>
      <td>
        <div className="pos-ticket-producto">
          <span className="pos-ticket-miniatura" aria-hidden="true">
            <Package size={16} strokeWidth={1.5} />
          </span>
          <div>
            <strong>
              {item.nombre}
              {alerta ? (
                <span
                  className="pos-stock-alerta"
                  title="Stock local: 0 — se cobrará con descuadre de inventario"
                >
                  <AlertTriangle size={14} strokeWidth={2.25} />
                  Stock local: 0
                </span>
              ) : null}
            </strong>
            <small>{item.categoria_nombre || item.sku}</small>
          </div>
        </div>
      </td>
      <td className="text-center">
        <CantidadRapida
          cantidad={item.cantidad}
          maximo={maximo}
          onCambio={(valor) => onCantidad(item.id_producto, valor)}
        />
      </td>
      <td className="text-end">{dinero(item.precio)}</td>
      <td className="text-end fw-semibold">{dinero(item.precio * item.cantidad)}</td>
      <td className="text-end">
        <button
          type="button"
          className="pos-btn-quitar"
          title={`Quitar ${item.nombre}`}
          onClick={() => onQuitar(item.id_producto)}
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </button>
      </td>
    </tr>
  );
}

export default TicketLinea;
