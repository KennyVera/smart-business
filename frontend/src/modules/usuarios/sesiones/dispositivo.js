export function describirDispositivo(agente) {
  const texto = agente || "";
  if (!texto) return "Dispositivo desconocido";
  const sistema = /Android/i.test(texto)
    ? "Android"
    : /iPhone|iPad/i.test(texto)
      ? "iOS"
      : /Mac OS/i.test(texto)
        ? "macOS"
        : /Windows/i.test(texto)
          ? "Windows"
          : "Web";
  const navegador = /Edg/i.test(texto)
    ? "Edge"
    : /Chrome/i.test(texto)
      ? "Chrome"
      : /Firefox/i.test(texto)
        ? "Firefox"
        : /Safari/i.test(texto)
          ? "Safari"
          : "Navegador";
  return `${navegador} · ${sistema}`;
}

export function formatearFecha(valor) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
