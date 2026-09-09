import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { LIMITES, filtrarCampo } from "../validacion";
import "./campo-clave.css";

/** Input de contraseña con ojito y tope de longitud. */
function CampoClave({
  value,
  onChange,
  className = "form-control",
  wrapperClassName = "",
  maxLength = LIMITES.clave,
  minLength = 8,
  limitar = true,
  ...props
}) {
  const [ver, setVer] = useState(false);

  function alCambiar(evento) {
    const crudo = evento.target.value;
    const valor = limitar ? filtrarCampo("clave", crudo) : crudo.slice(0, maxLength);
    if (valor === value) return;
    onChange?.({
      ...evento,
      target: { ...evento.target, value: valor },
    });
  }

  return (
    <div className={`campo-clave ${wrapperClassName}`.trim()}>
      <input
        {...props}
        className={className}
        type={ver ? "text" : "password"}
        value={value}
        onChange={alCambiar}
        maxLength={maxLength}
        minLength={minLength}
      />
      <button
        type="button"
        className="campo-clave-ojo"
        onClick={() => setVer((actual) => !actual)}
        aria-label={ver ? "Ocultar contraseña" : "Ver contraseña"}
        tabIndex={-1}
      >
        {ver ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
      </button>
    </div>
  );
}

export default CampoClave;
