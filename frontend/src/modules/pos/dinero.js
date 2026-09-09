const CENTAVOS = 100;

export function numero(valor) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

/** Suma en centavos para que el total del ticket no arrastre decimales. */
export function redondear(valor) {
  return Math.round(numero(valor) * CENTAVOS) / CENTAVOS;
}

export function dinero(valor) {
  return `$ ${redondear(valor).toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function textoMonto(valor) {
  return redondear(valor).toFixed(2);
}
