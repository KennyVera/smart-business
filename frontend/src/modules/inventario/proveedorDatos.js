/** Digitos aleatorios (crypto si está disponible). */
function digitos(largo) {
  let out = "";
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint8Array(largo);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < largo; i += 1) {
      out += String(buf[i] % 10);
    }
    return out;
  }
  for (let i = 0; i < largo; i += 1) {
    out += String(Math.floor(Math.random() * 10));
  }
  return out;
}

/** RUC de 13 dígitos (patrón empresa: base 10 + 001). */
export function generarRucCandidato() {
  return `${digitos(10)}001`;
}

/**
 * RUC que no esté en `usados` (Set de strings).
 * Reintenta ante colisión.
 */
export function generarRucUnico(usados = new Set()) {
  const ocupados = usados instanceof Set ? usados : new Set(usados);
  for (let intento = 0; intento < 24; intento += 1) {
    const ruc = generarRucCandidato();
    if (!ocupados.has(ruc)) return ruc;
  }
  return `${String(Date.now()).slice(-10)}001`;
}

/** Celular ecuatoriano 10 dígitos (09XXXXXXXX). */
export function generarTelefonoCandidato() {
  return `09${digitos(8)}`;
}

/**
 * Teléfono que no esté en `usados` (Set de strings).
 */
export function generarTelefonoUnico(usados = new Set()) {
  const ocupados = usados instanceof Set ? usados : new Set(usados);
  for (let intento = 0; intento < 24; intento += 1) {
    const telefono = generarTelefonoCandidato();
    if (!ocupados.has(telefono)) return telefono;
  }
  return `09${String(Date.now()).slice(-8)}`;
}
