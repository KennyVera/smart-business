import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { destinoSeguro, MSG_ACCESO_DENEGADO, tieneRol } from "../rbac";
import { rolDeSesion } from "../auth/sesion";
import { mostrarToast } from "../../../shared/toast";

/**
 * Guarda de ruta por rol. Si el rol no está permitido, redirige al home
 * del usuario y muestra toast de acceso denegado.
 */
function RequireRol({
  roles,
  to,
  denyMessage = MSG_ACCESO_DENEGADO,
  silent = false,
}) {
  const rol = rolDeSesion();
  const permitido = tieneRol(roles, rol);
  const destino = to || destinoSeguro(rol);

  useEffect(() => {
    if (!permitido && !silent && denyMessage) {
      mostrarToast(denyMessage, "danger");
    }
  }, [permitido, silent, denyMessage]);

  if (!permitido) {
    return <Navigate to={destino} replace />;
  }
  return <Outlet />;
}

export default RequireRol;
