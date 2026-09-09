import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { usePreferences } from "../context/PreferencesContext";
import { suscribirConfirm } from "./confirm";
import "./confirm.css";

const ICONOS = {
  peligro: ShieldAlert,
  aviso: AlertTriangle,
  info: AlertTriangle,
};

function ConfirmHost() {
  const { colorLogs } = usePreferences();
  const acento = colorLogs || "#00AA5D";
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    return suscribirConfirm((siguiente) => {
      setPedido((actual) => {
        if (actual) actual.resolve(false);
        return siguiente;
      });
    });
  }, []);

  function cerrar(ok) {
    pedido?.resolve(ok);
    setPedido(null);
  }

  const Icono = ICONOS[pedido?.variante] || AlertTriangle;
  const abierto = Boolean(pedido);

  return (
    <Modal
      show={abierto}
      onHide={() => cerrar(false)}
      centered
      backdrop="static"
      dialogClassName="sb-confirm-dialog"
      contentClassName="sb-confirm"
    >
      {pedido ? (
        <>
          <div className="sb-confirm-barra" style={{ background: acento }} />
          <div className="sb-confirm-cuerpo">
            <span
              className="sb-confirm-icono"
              style={{
                background: `${acento}18`,
                color: acento,
              }}
            >
              <Icono size={26} strokeWidth={1.75} />
            </span>
            <div>
              <h3>{pedido.titulo}</h3>
              <p>{pedido.mensaje}</p>
            </div>
          </div>
          <div className="sb-confirm-acciones">
            <button
              type="button"
              className="sb-confirm-btn is-ghost"
              onClick={() => cerrar(false)}
            >
              {pedido.cancelar}
            </button>
            <button
              type="button"
              className="sb-confirm-btn is-primary"
              style={{ background: acento }}
              onClick={() => cerrar(true)}
              autoFocus
            >
              {pedido.aceptar}
            </button>
          </div>
        </>
      ) : null}
    </Modal>
  );
}

export default ConfirmHost;
