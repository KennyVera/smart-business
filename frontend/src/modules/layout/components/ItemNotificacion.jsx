import { DollarSign, Info, Package } from "lucide-react";

function IconoTipo({ tipo }) {
  if (tipo === "CAJA") return <DollarSign size={16} strokeWidth={2} />;
  if (tipo === "INVENTARIO") return <Package size={16} strokeWidth={2} />;
  return <Info size={16} strokeWidth={2} />;
}

function ItemNotificacion({ nota, onLeer }) {
  return (
    <button
      type="button"
      className={`header-notif-item${!nota.leida ? " is-nueva" : ""}`}
      onClick={() => onLeer(nota.id_notificacion)}
    >
      <span className="header-notif-icono" data-tipo={nota.tipo}>
        <IconoTipo tipo={nota.tipo} />
      </span>
      <span className="header-notif-texto">
        <strong>{nota.titulo}</strong>
        <small>{nota.mensaje}</small>
      </span>
    </button>
  );
}

export default ItemNotificacion;
