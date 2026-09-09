/** Utilidades de color para reportes (acento de preferencias del usuario). */

export const ACENTO_DEF = "#00aa5d";

function hexARgb(hex) {
  const limpio = String(hex || "")
    .replace("#", "")
    .trim();
  const full =
    limpio.length === 3
      ? limpio
          .split("")
          .map((c) => c + c)
          .join("")
      : limpio;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 0, g: 170, b: 93 };
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbAHex({ r, g, b }) {
  const a = (n) => n.toString(16).padStart(2, "0");
  return `#${a(r)}${a(g)}${a(b)}`;
}

/** Mezcla un color con blanco (t=0) o negro (t=1) vía factor 0..1 hacia `otro`. */
export function mezclarHex(hex, otroHex, t) {
  const a = hexARgb(hex);
  const b = hexARgb(otroHex);
  const f = Math.min(Math.max(t, 0), 1);
  return rgbAHex({
    r: Math.round(a.r + (b.r - a.r) * f),
    g: Math.round(a.g + (b.g - a.g) * f),
    b: Math.round(a.b + (b.b - a.b) * f),
  });
}

/** Paleta derivada del color de gráficos del usuario (sin colores fijos ajenos). */
export function paletaDesdeAcento(acento = ACENTO_DEF) {
  const base = acento || ACENTO_DEF;
  return [
    base,
    mezclarHex(base, "#FFFFFF", 0.35),
    mezclarHex(base, "#000000", 0.22),
    mezclarHex(base, "#FFFFFF", 0.55),
    mezclarHex(base, "#000000", 0.4),
    mezclarHex(base, "#FFFFFF", 0.2),
    mezclarHex(base, "#000000", 0.12),
  ];
}

/** Variables CSS del módulo de reportes según preferencia. */
export function varsAcento(acento = ACENTO_DEF) {
  const base = acento || ACENTO_DEF;
  return {
    "--rep-verde": base,
    "--rep-verde-oscuro": mezclarHex(base, "#000000", 0.22),
    "--rep-verde-suave": mezclarHex(base, "#FFFFFF", 0.88),
  };
}
