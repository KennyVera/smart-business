import { MapPin, Phone, Store } from "lucide-react";
import { Badge, ListGroup, Offcanvas } from "react-bootstrap";
import Paginacion from "../../../shared/Paginacion";
import { usePaginacion } from "../../../shared/usePaginacion";
import SucursalEstado from "./SucursalEstado";
import "./sucursal-detalle.css";

function SucursalDetalleOffcanvas({ show, detalle, onClose }) {
  const sucursal = detalle?.sucursal;
  const usuarios = detalle?.usuarios || [];
  const terminales = detalle?.terminales || [];
  const equipo = usePaginacion(usuarios);
  const pos = usePaginacion(terminales);

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      className="sucursal-detalle-offcanvas"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="sucursal-detalle-titulo">
          <Store size={18} strokeWidth={1.75} />
          <span>{sucursal?.nombre || "Detalle"}</span>
          {sucursal ? <SucursalEstado activa={sucursal.activa} /> : null}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!sucursal ? (
          <p className="text-muted mb-0">Cargando detalle...</p>
        ) : (
          <>
            <section className="sucursal-detalle-info">
              <p>
                <MapPin size={15} strokeWidth={1.75} />
                <span>{sucursal.direccion || "Sin dirección"}</span>
              </p>
              <p>
                <Phone size={15} strokeWidth={1.75} />
                <span>{sucursal.telefono || "Sin teléfono"}</span>
              </p>
            </section>

            <h6 className="sucursal-detalle-seccion">Usuarios asignados</h6>
            {usuarios.length === 0 ? (
              <p className="text-muted">
                Aún no hay cajeros ni gerentes en este local.
              </p>
            ) : (
              <>
                <ListGroup variant="flush" className="sucursal-detalle-lista">
                  {equipo.visibles.map((item) => (
                    <ListGroup.Item
                      key={item.id_usuario}
                      className="d-flex justify-content-between align-items-center gap-2"
                    >
                      <div className="sucursal-detalle-persona">
                        <strong>{item.nombre}</strong>
                        <small>@{item.username}</small>
                      </div>
                      <Badge bg="light" text="dark" pill>
                        {item.rol}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Paginacion
                  {...equipo}
                  etiqueta="usuarios"
                  compacta
                  onCambio={equipo.irA}
                />
              </>
            )}

            <h6 className="sucursal-detalle-seccion">Terminales POS</h6>
            {terminales.length === 0 ? (
              <p className="text-muted mb-0">
                Aún no hay datáfonos asignados a este local.
              </p>
            ) : (
              <>
                <ListGroup variant="flush" className="sucursal-detalle-lista">
                  {pos.visibles.map((item) => (
                    <ListGroup.Item
                      key={item.id_terminal}
                      className="d-flex justify-content-between align-items-center gap-2"
                    >
                      <strong>Serie {item.numero_serie}</strong>
                      <span
                        className={`sucursal-pos-dot${
                          item.estado_activo ? " is-on" : " is-off"
                        }`}
                      >
                        {item.estado_activo ? "Activo" : "Inactivo"}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Paginacion
                  {...pos}
                  etiqueta="terminales"
                  compacta
                  onCambio={pos.irA}
                />
              </>
            )}
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default SucursalDetalleOffcanvas;
