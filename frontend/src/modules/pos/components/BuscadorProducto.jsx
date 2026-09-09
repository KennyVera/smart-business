import { Barcode, Search } from "lucide-react";

function BuscadorProducto({ valor, inputRef, onValor, onBuscar }) {
  function alTeclear(evento) {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    onBuscar(valor);
  }

  return (
    <div className="pos-buscador">
      <span className="pos-buscador-icono" aria-hidden="true">
        <Barcode size={22} strokeWidth={1.75} />
      </span>
      <input
        ref={inputRef}
        type="text"
        className="pos-buscador-input"
        placeholder="Escanea el código de barras o busca el producto..."
        value={valor}
        autoFocus
        autoComplete="off"
        spellCheck="false"
        aria-label="Buscar producto por código de barras o nombre"
        onChange={(evento) => onValor(evento.target.value)}
        onKeyDown={alTeclear}
      />
      <button
        type="button"
        className="pos-buscador-btn"
        title="Buscar"
        onClick={() => onBuscar(valor)}
      >
        <Search size={20} strokeWidth={2.25} />
      </button>
    </div>
  );
}

export default BuscadorProducto;
