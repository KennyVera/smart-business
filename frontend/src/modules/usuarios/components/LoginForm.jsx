import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { login } from "../api/authApi";
import { guardarSesion } from "../auth/sesion";

function LoginForm() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const { data } = await login(usuario, clave);
      guardarSesion(data, recordar);
      navigate("/", { replace: true });
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <label className="login-field">
        <User size={16} strokeWidth={1.75} />
        <input
          value={usuario}
          onChange={(event) => setUsuario(event.target.value)}
          placeholder="Usuario o correo electrónico"
          autoComplete="username"
          required
        />
      </label>
      <label className="login-field">
        <Lock size={16} strokeWidth={1.75} />
        <input
          type={verClave ? "text" : "password"}
          value={clave}
          onChange={(event) => setClave(event.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          className="login-eye"
          onClick={() => setVerClave((actual) => !actual)}
          aria-label={verClave ? "Ocultar contraseña" : "Ver contraseña"}
        >
          {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </label>
      <div className="login-row">
        <label className="login-remember">
          <input
            type="checkbox"
            checked={recordar}
            onChange={(event) => setRecordar(event.target.checked)}
          />
          Recordarme
        </label>
        <button type="button" className="login-forgot">
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      {error ? <p className="login-error">{error}</p> : null}
      <button type="submit" className="login-submit" disabled={enviando}>
        {enviando ? "Ingresando..." : "Iniciar sesión"}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}

export default LoginForm;
