import { useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { suscribirToast } from "./toast";

function ToastHost() {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    return suscribirToast((aviso) => {
      setAvisos((prev) => [...prev.slice(-4), aviso]);
    });
  }, []);

  function quitar(id) {
    setAvisos((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <ToastContainer position="top-end" className="p-3 toast-host">
      {avisos.map((aviso) => (
        <Toast
          key={aviso.id}
          bg={aviso.variant}
          onClose={() => quitar(aviso.id)}
          show
          delay={3500}
          autohide
        >
          <Toast.Body className={aviso.variant === "danger" ? "text-white" : ""}>
            {aviso.mensaje}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}

export default ToastHost;
