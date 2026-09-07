import html2pdf from "html2pdf.js";

const ESCALA_GRAFICO = 2;

export function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * html2canvas no dibuja SVG de forma confiable, así que el gráfico de recharts
 * se convierte antes a PNG y al PDF entra como imagen.
 */
export function graficoAImagen(svg, cuadrado = false) {
  if (!svg) return Promise.resolve("");
  const caja = svg.getBoundingClientRect();
  const ancho = Math.round(caja.width) || 640;
  const alto = Math.round(caja.height) || 280;
  // El pastel se recorta al centro para que no arrastre el blanco de los lados.
  const visible = cuadrado ? Math.min(ancho, alto) : ancho;
  const desplazamiento = (ancho - visible) / 2;

  const copia = svg.cloneNode(true);
  copia.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copia.setAttribute("width", ancho);
  copia.setAttribute("height", alto);
  const marcado = new XMLSerializer().serializeToString(copia);

  return new Promise((resolve) => {
    const imagen = new Image();
    imagen.onload = () => {
      const lienzo = document.createElement("canvas");
      lienzo.width = visible * ESCALA_GRAFICO;
      lienzo.height = alto * ESCALA_GRAFICO;
      const pincel = lienzo.getContext("2d");
      pincel.fillStyle = "#ffffff";
      pincel.fillRect(0, 0, lienzo.width, lienzo.height);
      pincel.drawImage(
        imagen,
        desplazamiento,
        0,
        visible,
        alto,
        0,
        0,
        lienzo.width,
        lienzo.height,
      );
      resolve(lienzo.toDataURL("image/png"));
    };
    imagen.onerror = () => resolve("");
    imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(marcado)}`;
  });
}

export function nombreArchivo(titulo) {
  const ahora = new Date();
  const dos = (valor) => String(valor).padStart(2, "0");
  const sello = [
    ahora.getFullYear(),
    dos(ahora.getMonth() + 1),
    dos(ahora.getDate()),
  ].join("-");
  const hora = `${dos(ahora.getHours())}${dos(ahora.getMinutes())}`;
  const base = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `smart-business_${base}_${sello}_${hora}.pdf`;
}

export function generarPdf(nodo, nombre) {
  return html2pdf()
    .set({
      margin: [8, 8, 10, 8],
      filename: nombre,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    })
    .from(nodo)
    .save();
}

export function selloAuditoria(sesion) {
  const ahora = new Date();
  return {
    usuario: sesion?.nombre_completo || sesion?.username || "Usuario",
    rol: sesion?.rol_nombre || "Sin rol",
    fecha: ahora.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    hora: ahora.toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}
