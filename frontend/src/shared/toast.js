const listeners = new Set();

export function mostrarToast(mensaje, variant = "danger") {
  const aviso = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mensaje,
    variant,
  };
  listeners.forEach((fn) => fn(aviso));
}

export function suscribirToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
