import { iniciales } from "../auth/sesion";
import "./avatar-perfil.css";

/** Avatar circular: foto o iniciales. */
function AvatarPerfil({ nombre, foto, className = "", size = "md" }) {
  const clases = `upd-avatar size-${size} ${className}`.trim();
  if (foto) {
    return <img src={foto} alt="" className={`${clases} has-foto`} />;
  }
  return <span className={clases}>{iniciales(nombre || "U")}</span>;
}

export default AvatarPerfil;
