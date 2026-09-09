import { Navigate, Outlet } from "react-router-dom";
import { rolDeSesion } from "../auth/sesion";

function RequireRol({ roles, to = "/" }) {
  if (!roles.includes(rolDeSesion())) {
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}

export default RequireRol;
