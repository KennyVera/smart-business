import { Cake, Crown, Save, ShoppingBag, Ticket, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { mensajeApi } from "../../usuarios/rol";
import {
  fetchClienteGerente,
  patchClienteGerente,
} from "../api/clientesGerenteApi";
import { dineroGerente, fechaHoraCorta } from "../formato";

const VACIO = { telefono: "", correo: "", fecha_nacimiento: "" };

function OffcanvasCliente({ show, cliente, onClose, onActualizado }) {
  const clienteId = cliente?.id_cliente;
  const [detalle, setDetalle] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!show || !clienteId) return undefined;
    let vivo = true;
    setCargando(true);
    setError("");
    setOk("");
    setDetalle(cliente || null);
    setForm({
      telefono: cliente?.telefono || "",
      correo: cliente?.correo || "",
      fecha_nacimiento: cliente?.fecha_nacimiento || "",
    });

    fetchClienteGerente(clienteId)
      .then(({ data }) => {
        if (!vivo) return;
        setDetalle(data);
        setForm({
          telefono: data.telefono || "",
          correo: data.correo || "",
          fecha_nacimiento: data.fecha_nacimiento || "",
        });
      })
      .catch((err) => {
        if (vivo) {
          setError(mensajeApi(err, "No se pudo cargar el detalle del cliente."));
        }
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });

    return () => {
      vivo = false;
    };
  }, [show, clienteId]);

  function cambiar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    if (!clienteId) return;
    setGuardando(true);
    setError("");
    setOk("");
    try {
      const { data } = await patchClienteGerente(clienteId, {
        telefono: form.telefono || null,
        correo: form.correo || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
      });
      setDetalle(data);
      setForm({
        telefono: data.telefono || "",
        correo: data.correo || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
      });
      setOk("Datos guardados correctamente.");
      onActualizado?.(data);
    } catch (err) {
      setError(mensajeApi(err, "No se pudieron guardar los datos."));
    } finally {
      setGuardando(false);
    }
  }

  const visible = detalle || cliente;

  return (
    <Offcanvas
      show={show && Boolean(clienteId)}
      onHide={onClose}
      placement="end"
      className="gerente-offcanvas gerente-offcanvas-cliente"
    >
      <Offcanvas.Header closeButton className="gerente-cliente-off-head">
        <Offcanvas.Title className="gerente-off-title">
          <span className={`gerente-cliente-avatar${visible?.es_vip ? " is-vip" : ""}`}>
            <UserRound size={18} />
          </span>
          <span>
            <span className="d-inline-flex align-items-center gap-2">
              {visible?.nombre_completo || "Cliente"}
              {visible?.es_vip ? (
                <span className="badge gerente-vip-badge">
                  <Crown size={11} /> VIP
                </span>
              ) : null}
            </span>
            <small className="d-block text-muted fw-normal">
              {visible?.cedula_ruc || "—"}
            </small>
          </span>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        {ok ? <div className="alert alert-success py-2">{ok}</div> : null}
        {cargando ? <p className="text-muted">Actualizando ficha 360°…</p> : null}

        {visible ? (
          <>
            <section className="gerente-off-seccion">
              <h3>Datos personales</h3>
              <form className="gerente-cliente-form" onSubmit={guardar}>
                <label>
                  <span>Teléfono</span>
                  <input
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={10}
                    value={form.telefono}
                    onChange={(e) =>
                      cambiar("telefono", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="09xxxxxxxx"
                  />
                  {form.telefono && form.telefono.length !== 10 ? (
                    <small className="text-danger">El teléfono debe tener 10 dígitos.</small>
                  ) : null}
                </label>
                <label>
                  <span>Correo</span>
                  <input
                    type="email"
                    className="form-control"
                    maxLength={100}
                    value={form.correo}
                    onChange={(e) => cambiar("correo", e.target.value.slice(0, 100))}
                    placeholder="cliente@correo.com"
                  />
                </label>
                <label>
                  <span>Fecha de nacimiento</span>
                  <input
                    type="date"
                    className="form-control"
                    value={form.fecha_nacimiento}
                    onChange={(e) => cambiar("fecha_nacimiento", e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  className="btn gerente-btn"
                  disabled={
                    guardando ||
                    (Boolean(form.telefono) && form.telefono.length !== 10)
                  }
                >
                  <Save size={15} />
                  {guardando ? "Guardando…" : "Guardar datos"}
                </button>
              </form>
            </section>

            <section className="gerente-off-seccion">
              <h3>Hábitos de consumo</h3>
              <div className="gerente-habitos-grid">
                <article>
                  <Ticket size={16} />
                  <small>Ticket promedio</small>
                  <strong>{dineroGerente(detalle?.ticket_promedio ?? 0)}</strong>
                </article>
                <article>
                  <ShoppingBag size={16} />
                  <small>Visitas</small>
                  <strong>{visible.frecuencia_visitas || 0}</strong>
                </article>
                <article>
                  <Crown size={16} />
                  <small>Total gastado</small>
                  <strong>{dineroGerente(visible.total_gastado)}</strong>
                </article>
              </div>
              <p className="gerente-filtro-hint mt-3 mb-2">
                Cumpleaños: {visible.fecha_nacimiento || "—"}
                {visible.cumple_mes ? <Cake size={14} className="gerente-cake ms-1" /> : null}
              </p>
              <p className="gerente-filtro-hint mb-2">Top 3 productos</p>
              {detalle?.top_productos?.length ? (
                <ul className="gerente-tickets">
                  {detalle.top_productos.map((item) => (
                    <li key={item.nombre}>
                      <span>{item.unidades} u.</span>
                      <span>{item.nombre}</span>
                      <strong>{dineroGerente(item.total)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">
                  {cargando ? "Cargando productos…" : "Sin compras registradas."}
                </p>
              )}
            </section>

            <section className="gerente-off-seccion">
              <h3>Historial reciente</h3>
              {detalle?.historial?.length ? (
                <ul className="gerente-tickets">
                  {detalle.historial.map((ticket) => (
                    <li key={ticket.id_venta}>
                      <span>#{ticket.id_venta}</span>
                      <span>{fechaHoraCorta(ticket.fecha_hora)}</span>
                      <strong>{dineroGerente(ticket.total_factura)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">
                  {cargando ? "Cargando historial…" : "Sin facturas en esta sucursal."}
                </p>
              )}
            </section>
          </>
        ) : null}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default OffcanvasCliente;
