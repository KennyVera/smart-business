export const MARGEN_ALEGRE = 30;
export const MARGEN_TRISTE = 15;

export function clasificarMargen(valor) {
  if (valor === null || valor === undefined) {
    return { tono: "neutro", texto: "Sin dato" };
  }
  if (valor >= MARGEN_ALEGRE) return { tono: "alegre", texto: "Alegre" };
  if (valor >= MARGEN_TRISTE) return { tono: "medio", texto: "Ajustado" };
  return { tono: "triste", texto: "Triste" };
}

export function formatearMargen(valor) {
  if (valor === null || valor === undefined) return "—";
  return `${valor.toFixed(1)}%`;
}

export function formatearDinero(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return "—";
  return `$ ${numero.toFixed(2)}`;
}

export function nivelStock(fila) {
  if (fila.cantidad_actual <= 0) return "critico";
  if (fila.cantidad_actual <= fila.stock_minimo) return "bajo";
  return "normal";
}

export function nivelCaducidad(dias) {
  if (dias < 0) return "critico";
  if (dias <= 7) return "bajo";
  return "normal";
}

export function textoCaducidad(dias) {
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} d`;
  if (dias === 0) return "Vence hoy";
  return `En ${dias} d`;
}
