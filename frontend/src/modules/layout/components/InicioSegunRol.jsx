import { Navigate } from "react-router-dom";
import AdminDashboardPage from "../../dashboard/pages/AdminDashboardPage";
import { inicioDeRol, rolDeSesion } from "../../usuarios/auth/sesion";

function InicioSegunRol() {
  const destino = inicioDeRol(rolDeSesion());
  if (destino !== "/") return <Navigate to={destino} replace />;
  return <AdminDashboardPage />;
}

export default InicioSegunRol;
