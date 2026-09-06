import { Modal } from "react-bootstrap";

function SucursalDetalleModal({ show, detalle, onClose }) {
  const sucursal = detalle?.sucursal;
  const usuarios = detalle?.usuarios || [];
  const terminales = detalle?.terminales || [];

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
              <ul className="mb-3">
                {usuarios.map((item) => (
                  <li key={item.id_usuario}>
                    {item.nombre} ({item.username}) — {item.rol}
                  </li>
                ))}
              </ul>
            )}
            <h6>Terminales POS</h6>
            {terminales.length === 0 ? (
              <p className="text-muted mb-0">Aún no hay datáfonos asignados a este local.</p>
            ) : (
              <ul className="mb-0">
                {terminales.map((item) => (
                  <li key={item.id_terminal}>
                    Serie {item.numero_serie} — {item.estado_activo ? "Activo" : "Inactivo"}
                  </li>
                ))}
              </ul>
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
