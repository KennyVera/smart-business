import { Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AbrirTurnoModal from "./components/AbrirTurnoModal";
import CerrarTurnoModal from "./components/CerrarTurnoModal";
import PosTopbar from "./components/PosTopbar";
import { useTurno } from "./hooks/usePos";
import "./pos.css";

/** Layout exclusivo del punto de venta: sin sidebar, solo topbar y trabajo. */
function PosLayout() {
  const { turno, resumen, terminales, cargando, error, recargar, aplicar } = useTurno();
  const [abrir, setAbrir] = useState(false);
  const [cerrar, setCerrar] = useState(false);

  useEffect(() => {
    if (cargando || error || turno) return;
    setAbrir(true);
  }, [cargando, error, turno]);

  return (
    <div className="pos-shell">
      <PosTopbar turno={turno} onCerrarTurno={() => setCerrar(true)} />

      <main className="pos-main">
        {error ? <p className="pos-error">{error}</p> : null}
        {!cargando && !turno ? (
          <div className="pos-banner">
            <span>
              No tienes un turno de caja abierto: puedes revisar el catálogo, pero
              no cobrar.
            </span>
            <button
              type="button"
              className="pos-btn-negro"
              onClick={() => setAbrir(true)}
            >
              <Unlock size={16} strokeWidth={2} />
              Abrir turno
            </button>
          </div>
        ) : null}
        <Outlet context={{ turno, resumen, aplicarTurno: aplicar, recargarTurno: recargar }} />
      </main>

      <AbrirTurnoModal
        show={abrir}
        terminales={terminales}
        onClose={() => setAbrir(false)}
        onAbierto={(datos) => {
          aplicar(datos);
          setAbrir(false);
        }}
      />
      <CerrarTurnoModal
        show={cerrar}
        turno={turno}
        resumen={resumen}
        onClose={() => {
          setCerrar(false);
          recargar();
        }}
        onCerrado={() => aplicar({ turno: null, resumen: null })}
      />
    </div>
  );
}

export default PosLayout;
