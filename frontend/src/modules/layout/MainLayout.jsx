import { Navigate, Outlet } from "react-router-dom";
import { rolDeSesion } from "../usuarios/auth/sesion";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ToastHost from "../../shared/ToastHost";
import "./layout.css";
import "./sidebar.css";
import "./header.css";

function MainLayout() {
  if (rolDeSesion() === "cajero") {
    return <Navigate to="/pos" replace />;
  }

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

export default MainLayout;
