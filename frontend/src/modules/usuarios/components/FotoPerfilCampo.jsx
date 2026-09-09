import { Camera } from "lucide-react";
import { useRef } from "react";
import AvatarPerfil from "./AvatarPerfil";
import "./foto-perfil-campo.css";

function FotoPerfilCampo({ nombre, preview, onElegir }) {
  const inputRef = useRef(null);

  return (
    <div className="upd-foto-campo">
      <button
        type="button"
        className="upd-foto-boton"
        onClick={() => inputRef.current?.click()}
        aria-label="Cambiar foto de perfil"
      >
        <AvatarPerfil nombre={nombre} foto={preview} size="xl" />
        <span className="upd-foto-overlay">
          <Camera size={18} strokeWidth={1.75} />
        </span>
      </button>
      <div>
        <strong>Foto de perfil</strong>
        <p className="text-muted mb-1">JPG o PNG, máximo 2 MB.</p>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => inputRef.current?.click()}
        >
          Subir foto
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={(e) => onElegir(e.target.files?.[0] || null)}
      />
    </div>
  );
}

export default FotoPerfilCampo;
