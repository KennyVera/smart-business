import { ScanBarcode, X } from "lucide-react";
import { useEffect, useRef } from "react";

function ProductoBuscador({ valor, total, onChange }) {
  const campo = useRef(null);

  useEffect(() => {
    campo.current?.focus();
  }, []);

  return (
    <div className="inv-scan">
      <ScanBarcode size={24} strokeWidth={1.6} />
      <input
        ref={campo}
        type="search"
        className="form-control"
        value={valor}
        maxLength={60}
        autoComplete="off"
        spellCheck="false"
        placeholder="Escanea el código de barras o escribe el nombre del producto"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
          if (event.key === "Escape") onChange("");
        }}
      />
      {valor ? (
        <button
          type="button"
          className="inv-scan-limpiar"
          title="Limpiar búsqueda"
          onClick={() => {
            onChange("");
            campo.current?.focus();
          }}
        >
          <X size={16} />
        </button>
      ) : null}
      <span className="inv-scan-total">{total} productos</span>
    </div>
  );
}

export default ProductoBuscador;
