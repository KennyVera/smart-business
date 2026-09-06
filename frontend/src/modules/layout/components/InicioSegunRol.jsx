import { Navigate } from "react-router-dom";
import AdminDashboardPage from "../../dashboard/pages/AdminDashboardPage";
import { rolDeSesion } from "../../usuarios/auth/sesion";

const INICIO_POR_ROL = {
  bodeguero: "/inventario/alertas",
};

function InicioSegunRol() {
  const destino = INICIO_POR_ROL[rolDeSesion()];
  if (destino) return <Navigate to={destino} replace />;
  return <AdminDashboardPage />;
}

export default InicioSegunRol;
