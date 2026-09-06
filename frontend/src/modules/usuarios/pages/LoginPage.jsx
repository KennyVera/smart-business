import { Navigate } from "react-router-dom";
import LoginBrand from "../components/LoginBrand";
import LoginForm from "../components/LoginForm";
import { leerSesion } from "../auth/sesion";
import "../login.css";
import "../login-form.css";

function LoginPage() {
  if (leerSesion()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <span className="login-orb login-orb--tr" />
      <span className="login-orb login-orb--br" />
      <div className="login-wrap">
        <LoginBrand />
        <h2>Bienvenido de nuevo</h2>
        <p className="login-lead">Inicia sesión para acceder a tu cuenta</p>
        <LoginForm />
        <div className="login-foot">
          <span>Smart Business ERP &amp; POS</span>
          <small>Más que un sistema, es tu aliado</small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
