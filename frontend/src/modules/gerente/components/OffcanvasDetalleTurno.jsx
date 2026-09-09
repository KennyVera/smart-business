import { Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { mensajeApi } from "../../usuarios/rol";
import { fetchDesgloseTurno, marcarTurnoAuditado } from "../api/gerenteApi";
import { dineroGerente, fechaHoraCorta } from "../formato";
import DesgloseEfectivo from "./DesgloseEfectivo";

function OffcanvasDetalleTurno({ show, turno, onClose, onAuditado }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const id = turno?.id_turno;

  useEffect(() => {
    if (!show || !id) return;
    setCargando(true);
    setError("");
    setDatos(null);
    fetchDesgloseTurno(id)
      .then(({ data }) => setDatos(data))
      .catch((err) => setError(mensajeApi(err, "No se pudo cargar el desglose.")))
      .finally(() => setCargando(false));
  }, [show, id]);

  async function auditar() {
    setGuardando(true);
    setError("");
    try {
      await marcarTurnoAuditado(id);
      onAuditado?.(id);
      onClose();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo marcar como auditado."));
    } finally {
      setGuardando(false);
    }
  }

  const auditado = datos?.auditado ?? turno?.auditado;

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" className="gerente-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="gerente-off-title">
          <Banknote size={18} />
          Detalle de Turno #{id}
          {auditado ? (
            <span className="badge text-bg-success ms-2">Auditado</span>
          ) : (
            <span className="badge text-bg-warning text-dark ms-2">Pendiente</span>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {error ? <p className="text-danger">{error}</p> : null}
        {cargando ? <p className="text-muted">Cargando desglose…</p> : null}
        {!cargando && datos ? (
          <>
            <section className="gerente-off-seccion">
              <h3>Resumen</h3>
              <dl className="gerente-off-dl">
                <dt>Cajero</dt>
                <dd>{datos.cajero}</dd>
                <dt>Caja</dt>
                <dd>{datos.terminal_serie}</dd>
                <dt>Apertura</dt>
                <dd>{fechaHoraCorta(datos.fecha_apertura)}</dd>
                <dt>Cierre</dt>
                <dd>{fechaHoraCorta(datos.fecha_cierre)}</dd>
              </dl>
            </section>
            <DesgloseEfectivo datos={datos} />
            <section className="gerente-off-seccion">
              <h3>Otros métodos</h3>
              <dl className="gerente-off-dl">
                <dt>Tarjeta</dt>
                <dd>{dineroGerente(datos.ventas_tarjeta)}</dd>
                <dt>Transferencia</dt>
                <dd>{dineroGerente(datos.ventas_transferencia)}</dd>
                <dt>Otros</dt>
                <dd>{dineroGerente(datos.ventas_otros)}</dd>
              </dl>
            </section>
            {(datos.tickets || []).length > 0 ? (
              <section className="gerente-off-seccion">
                <h3>Últimos tickets</h3>
                <ul className="gerente-tickets">
                  {datos.tickets.map((t) => (
                    <li key={t.id_venta}>
                      <span>#{t.id_venta}</span>
                      <span>{fechaHoraCorta(t.fecha_hora)}</span>
                      <strong>{dineroGerente(t.total_factura)}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {!auditado ? (
              <button
                type="button"
                className="btn gerente-btn w-100 mt-3"
                disabled={guardando}
                onClick={auditar}
              >
                {guardando ? "Guardando…" : "Marcar como Auditado"}
              </button>
            ) : null}
          </>
        ) : null}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default OffcanvasDetalleTurno;
