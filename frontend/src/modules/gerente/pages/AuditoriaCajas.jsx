import { useCallback, useEffect, useState } from "react";
import { mensajeApi } from "../../usuarios/rol";
import { fetchAuditoriaCajas } from "../api/gerenteApi";
import FiltrosAuditoria from "../components/FiltrosAuditoria";
import OffcanvasDetalleTurno from "../components/OffcanvasDetalleTurno";
import TablaAuditoria from "../components/TablaAuditoria";
import {
  acotarFecha,
  fechaISO,
  fechaMinAuditoria,
  hoyISO,
  validarRangoFechas,
} from "../formato";
import "../gerente.css";

function AuditoriaCajas() {
  const [desde, setDesde] = useState(() => fechaISO(6));
  const [hasta, setHasta] = useState(() => hoyISO());
  const [turnos, setTurnos] = useState([]);
  const [error, setError] = useState("");
  const [errorFecha, setErrorFecha] = useState("");
  const [turnoActivo, setTurnoActivo] = useState(null);

  const cargar = useCallback((inicio, fin) => {
    const validacion = validarRangoFechas(inicio, fin);
    setDesde(validacion.desde);
    setHasta(validacion.hasta);
    if (!validacion.ok) {
      setErrorFecha(validacion.error);
      return;
    }
    setErrorFecha("");
    setError("");
    fetchAuditoriaCajas({
      fecha_inicio: validacion.desde,
      fecha_fin: validacion.hasta,
    })
      .then(({ data }) => setTurnos(data))
      .catch((err) => setError(mensajeApi(err, "No se pudo cargar la auditoría.")));
  }, []);

  useEffect(() => {
    cargar(fechaISO(6), hoyISO());
  }, [cargar]);

  function cambiarDesde(valor) {
    const acotado = acotarFecha(valor, fechaMinAuditoria(), hoyISO());
    setDesde(acotado);
    setErrorFecha(acotado > hasta ? "La fecha Desde no puede ser posterior a Hasta." : "");
  }

  function cambiarHasta(valor) {
    const acotado = acotarFecha(valor, fechaMinAuditoria(), hoyISO());
    setHasta(acotado);
    setErrorFecha(desde > acotado ? "La fecha Desde no puede ser posterior a Hasta." : "");
  }

  function onAuditado(idTurno) {
    setTurnos((prev) =>
      prev.map((t) => (t.id_turno === idTurno ? { ...t, auditado: true } : t))
    );
  }

  return (
    <div className="gerente-page">
      <header className="gerente-page-head">
        <div>
          <p className="gerente-eyebrow">Control de caja</p>
          <h1>Auditoría de cajas</h1>
        </div>
      </header>
      <FiltrosAuditoria
        desde={desde}
        hasta={hasta}
        errorFecha={errorFecha}
        onDesde={cambiarDesde}
        onHasta={cambiarHasta}
        onFiltrar={() => cargar(desde, hasta)}
      />
      {error ? <p className="text-danger">{error}</p> : null}
      <TablaAuditoria turnos={turnos} onVerDetalle={setTurnoActivo} />
      <OffcanvasDetalleTurno
        show={Boolean(turnoActivo)}
        turno={turnoActivo}
        onClose={() => setTurnoActivo(null)}
        onAuditado={onAuditado}
      />
    </div>
  );
}

export default AuditoriaCajas;
