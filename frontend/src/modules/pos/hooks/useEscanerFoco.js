import { useCallback, useEffect, useRef } from "react";

const CAMPOS = "input, textarea, select, button.pos-cant, .pos-cant-input, .modal, [role='dialog']";

/**
 * La pistola de código de barras escribe donde esté el foco: si el cajero
 * suelta el mouse en cualquier parte, el input de búsqueda lo recupera.
 */
export function useEscanerFoco(activo = true) {
  const ref = useRef(null);

  const enfocar = useCallback(() => {
    const nodo = ref.current;
    if (!nodo || document.activeElement === nodo) return;
    if (document.querySelector(".modal.show")) return;
    nodo.focus();
    nodo.select?.();
  }, []);

  useEffect(() => {
    if (!activo) return undefined;
    enfocar();
    function alSoltar(evento) {
      if (evento.target.closest?.(CAMPOS)) return;
      enfocar();
    }
    function alPerderFoco() {
      requestAnimationFrame(() => {
        const actual = document.activeElement;
        if (actual?.closest?.(CAMPOS)) return;
        enfocar();
      });
    }
    document.addEventListener("mouseup", alSoltar);
    document.addEventListener("focusout", alPerderFoco);
    return () => {
      document.removeEventListener("mouseup", alSoltar);
      document.removeEventListener("focusout", alPerderFoco);
    };
  }, [activo, enfocar]);

  return { ref, enfocar };
}
