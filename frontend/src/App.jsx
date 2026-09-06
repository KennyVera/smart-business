import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./modules/layout/MainLayout";
import AdminDashboardPage from "./modules/dashboard/pages/AdminDashboardPage";
import ZonasPage from "./modules/geografia/pages/ZonasPage";
import SucursalesPage from "./modules/geografia/pages/SucursalesPage";
import UsuariosPage from "./modules/usuarios/pages/UsuariosPage";
import LoginPage from "./modules/usuarios/pages/LoginPage";
import RequireAuth from "./modules/usuarios/components/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="geografia/zonas" element={<ZonasPage />} />
            <Route path="geografia/sucursales" element={<SucursalesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
