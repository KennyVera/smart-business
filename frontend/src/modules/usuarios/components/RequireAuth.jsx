import { Navigate, Outlet } from "react-router-dom";
import { leerSesion } from "../auth/sesion";

function RequireAuth() {
  if (!leerSesion()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default RequireAuth;
