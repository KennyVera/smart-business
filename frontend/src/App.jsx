import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PreferencesLayout } from "./context/PreferencesContext";
import MainLayout from "./modules/layout/MainLayout";
import InicioSegunRol from "./modules/layout/components/InicioSegunRol";
import ZonasPage from "./modules/geografia/pages/ZonasPage";
import SucursalesPage from "./modules/geografia/pages/SucursalesPage";
import UsuariosPage from "./modules/usuarios/pages/UsuariosPage";
import CatalogoPage from "./modules/inventario/pages/CatalogoPage";
import CategoriasPage from "./modules/inventario/pages/CategoriasPage";
import StockPage from "./modules/inventario/pages/StockPage";
import AlertasPage from "./modules/inventario/pages/AlertasPage";
import ReportesInventario from "./modules/inventario/pages/ReportesInventario";
import LoginPage from "./modules/usuarios/pages/LoginPage";
import RequireAuth from "./modules/usuarios/components/RequireAuth";
import RequireRol from "./modules/usuarios/components/RequireRol";
import PosLayout from "./modules/pos/PosLayout";
import PosWorkspace from "./modules/pos/pages/PosWorkspace";
import DashboardGerente from "./modules/gerente/pages/DashboardGerente";
import AuditoriaCajas from "./modules/gerente/pages/AuditoriaCajas";
import Devoluciones from "./modules/gerente/pages/Devoluciones";
import ClientesList from "./modules/gerente/pages/ClientesList";
import {
  ROLES_ADMIN,
  ROLES_GERENCIAL,
  ROLES_INVENTARIO_LECTURA,
  ROLES_INVENTARIO_OPS,
  ROLES_POS,
} from "./modules/usuarios/rbac";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<PreferencesLayout />}>
            <Route element={<RequireRol roles={ROLES_POS} silent />}>
              <Route path="pos" element={<PosLayout />}>
                <Route index element={<PosWorkspace />} />
              </Route>
            </Route>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<InicioSegunRol />} />
              <Route element={<RequireRol roles={ROLES_ADMIN} />}>
                <Route path="geografia/zonas" element={<ZonasPage />} />
                <Route path="geografia/sucursales" element={<SucursalesPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
              </Route>
              <Route element={<RequireRol roles={ROLES_GERENCIAL} />}>
                <Route path="gerente" element={<DashboardGerente />} />
                <Route path="gerente/auditoria" element={<AuditoriaCajas />} />
                <Route path="gerente/devoluciones" element={<Devoluciones />} />
                <Route path="gerente/clientes" element={<ClientesList />} />
              </Route>
              <Route element={<RequireRol roles={ROLES_INVENTARIO_OPS} />}>
                <Route path="inventario/catalogo" element={<CatalogoPage />} />
                <Route path="inventario/categorias" element={<CategoriasPage />} />
                <Route path="inventario/stock" element={<StockPage />} />
              </Route>
              <Route element={<RequireRol roles={ROLES_INVENTARIO_LECTURA} />}>
                <Route path="inventario/alertas" element={<AlertasPage />} />
                <Route path="inventario/reportes" element={<ReportesInventario />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
