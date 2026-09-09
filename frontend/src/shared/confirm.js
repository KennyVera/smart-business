const listeners = new Set();

/**
 * Confirmación global (reemplaza window.confirm).
 * @returns {Promise<boolean>}
 */
export function confirmar(mensaje, opciones = {}) {
  return new Promise((resolve) => {
    const pedido = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mensaje,
      titulo: opciones.titulo || "Confirmar acción",
      aceptar: opciones.aceptar || "Aceptar",
      cancelar: opciones.cancelar || "Cancelar",
      variante: opciones.variante || "aviso",
      resolve,
    };
    listeners.forEach((fn) => fn(pedido));
  });
}

export function suscribirConfirm(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
