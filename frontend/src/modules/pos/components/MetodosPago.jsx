import {
  ArrowLeftRight,
  Banknote,
  Check,
  CreditCard,
  MoreHorizontal,
  Wallet,
} from "lucide-react";

const ICONOS = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  transferencia: ArrowLeftRight,
  otros: MoreHorizontal,
};

export function esEfectivo(metodo) {
  return (metodo?.nombre || "").trim().toLowerCase() === "efectivo";
}

function MetodosPago({ metodos, seleccion, onSeleccion }) {
  return (
    <div className="pos-pago">
      <span className="pos-etiqueta">Método de pago</span>
      <div className="pos-pago-grid">
        {metodos.map((metodo) => {
          const clave = (metodo.nombre || "").trim().toLowerCase();
          const Icono = ICONOS[clave] || Wallet;
          const activa = seleccion?.id_metodo_pago === metodo.id_metodo_pago;
          return (
            <button
              key={metodo.id_metodo_pago}
              type="button"
              className={`pos-btn-pago${activa ? " is-activa" : ""}`}
              aria-pressed={activa}
              onClick={() => onSeleccion(metodo)}
            >
              {activa ? (
                <Check size={18} strokeWidth={2.5} />
              ) : (
                <Icono size={18} strokeWidth={1.75} />
              )}
              {metodo.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MetodosPago;
