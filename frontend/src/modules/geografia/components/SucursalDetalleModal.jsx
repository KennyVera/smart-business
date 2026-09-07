import { Modal } from "react-bootstrap";
import Paginacion from "../../../shared/Paginacion";
import { usePaginacion } from "../../../shared/usePaginacion";

function SucursalDetalleModal({ show, detalle, onClose }) {
  const sucursal = detalle?.sucursal;
  const usuarios = detalle?.usuarios || [];
  const terminales = detalle?.terminales || [];
  const equipo = usePaginacion(usuarios);
  const pos = usePaginacion(terminales);

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{sucursal ? sucursal.nombre : "Detalle"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {sucursal ? (
          <>
            <p className="text-muted mb-3">
              {sucursal.direccion} · {sucursal.telefono || "Sin teléfono"}
            </p>
            <h6>Usuarios asignados</h6>
            {usuarios.length === 0 ? (
              <p className="text-muted">Aún no hay cajeros ni gerentes en este local.</p>
            ) : (
              <>
                <ul className="mb-0">
                  {equipo.visibles.map((item) => (
                    <li key={item.id_usuario}>
                      {item.nombre} ({item.username}) — {item.rol}
                    </li>
                  ))}
                </ul>
                <Paginacion
                  {...equipo}
                  etiqueta="usuarios"
                  compacta
                  onCambio={equipo.irA}
                />
              </>
            )}
            <h6 className="mt-3">Terminales POS</h6>
            {terminales.length === 0 ? (
              <p className="text-muted mb-0">Aún no hay datáfonos asignados a este local.</p>
            ) : (
              <>
                <ul className="mb-0">
                  {pos.visibles.map((item) => (
                    <li key={item.id_terminal}>
                      Serie {item.numero_serie} — {item.estado_activo ? "Activo" : "Inactivo"}
                    </li>
                  ))}
                </ul>
                <Paginacion {...pos} etiqueta="terminales" compacta onCambio={pos.irA} />
              </>
            )}
          </>
        ) : (
          <p className="text-muted mb-0">Cargando detalle...</p>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default SucursalDetalleModal;
