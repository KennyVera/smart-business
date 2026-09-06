import { Globe, Monitor, Power } from "lucide-react";
import { describirDispositivo, formatearFecha } from "../sesiones/dispositivo";

function SesionTarjeta({ sesion, onRevocar, revocando }) {
  return (
    <article className={`sesion-card${sesion.is_active ? " is-on" : ""}`}>
      <div className="sesion-card-top">
        <span className="sesion-card-fecha">{formatearFecha(sesion.fecha_inicio)}</span>
        {sesion.is_active ? (
          <span className="usuario-badge is-on">En línea</span>
        ) : (
          <span className="text-muted">Cierre {formatearFecha(sesion.fecha_fin)}</span>
        )}
      </div>
      <p className="sesion-card-meta">
        <Globe size={14} strokeWidth={1.75} />
        {sesion.ip_address || "IP no registrada"}
      </p>
      <p className="sesion-card-meta">
        <Monitor size={14} strokeWidth={1.75} />
        {describirDispositivo(sesion.user_agent)}
      </p>
      {sesion.is_active ? (
        <button
          type="button"
          className="sesion-power"
          disabled={revocando}
          onClick={() => onRevocar(sesion)}
        >
          <Power size={15} strokeWidth={2} />
          Cerrar sesión remotamente
        </button>
      ) : null}
    </article>
  );
}

export default SesionTarjeta;
