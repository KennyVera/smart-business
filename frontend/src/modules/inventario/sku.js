import { LIMITES } from "./validacion";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function aleatorio(largo) {
  let out = "";
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint8Array(largo);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < largo; i += 1) {
      out += ALFABETO[buf[i] % ALFABETO.length];
    }
    return out;
  }
  for (let i = 0; i < largo; i += 1) {
    out += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return out;
}

/** Genera un SKU tipo SB-XXXXXXXX (válido y tipicamente único). */
export function generarSkuCandidato() {
  return `SB-${aleatorio(8)}`.slice(0, LIMITES.sku);
}

/**
 * Genera un SKU que no esté en `usados` (Set de SKUs en mayúsculas).
 * Reintenta varias veces ante colisión.
 */
export function generarSkuUnico(usados = new Set()) {
  const ocupados = usados instanceof Set ? usados : new Set(usados);
  for (let intento = 0; intento < 24; intento += 1) {
    const sku = generarSkuCandidato();
    if (!ocupados.has(sku.toUpperCase())) return sku;
  }
  // Fallback con timestamp si hubo demasiadas colisiones.
  const fallback = `SB-${Date.now().toString(36).toUpperCase()}`.slice(0, LIMITES.sku);
  return fallback;
}
