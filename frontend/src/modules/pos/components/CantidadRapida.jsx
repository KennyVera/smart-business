import { useEffect, useRef, useState } from "react";

const SOLO_DIGITOS = /\D/g;

/** La cantidad es cliqueable: escribir "10" evita escanear diez veces. */
function CantidadRapida({ cantidad, maximo, onCambio }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(String(cantidad));
  const ref = useRef(null);

  useEffect(() => {
    setTexto(String(cantidad));
  }, [cantidad]);

  useEffect(() => {
    if (!editando) return;
    ref.current?.focus();
    ref.current?.select();
  }, [editando]);

  function confirmar() {
    setEditando(false);
    const valor = Number.parseInt(texto, 10);
    if (!Number.isFinite(valor) || valor < 1) {
      setTexto(String(cantidad));
      return;
    }
    onCambio(valor);
  }

  function cancelar() {
    setTexto(String(cantidad));
    setEditando(false);
  }

  if (!editando) {
    return (
      <button
        type="button"
        className="pos-cant"
        title={`Clic para escribir la cantidad (máximo ${maximo})`}
        onClick={() => setEditando(true)}
      >
        {cantidad}
      </button>
    );
  }

  return (
    <input
      ref={ref}
      className="pos-cant-input"
      inputMode="numeric"
      aria-label="Cantidad"
      value={texto}
      onChange={(evento) =>
        setTexto(evento.target.value.replace(SOLO_DIGITOS, "").slice(0, 4))
      }
      onBlur={confirmar}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") {
          evento.preventDefault();
          confirmar();
        }
        if (evento.key === "Escape") cancelar();
      }}
    />
  );
}

export default CantidadRapida;
