import JsBarcode from "jsbarcode";
import { formatearDinero } from "./margen";

const SVG_NS = "http://www.w3.org/2000/svg";

function codigoDeBarras(sku) {
  const svg = document.createElementNS(SVG_NS, "svg");
  try {
    JsBarcode(svg, sku, {
      format: "CODE128",
      width: 1.5,
      height: 44,
      fontSize: 13,
      margin: 0,
    });
  } catch {
    return `<p class="sin-codigo">${sku}</p>`;
  }
  return svg.outerHTML;
}

function etiqueta(producto) {
  return `
    <article class="etiqueta">
      <p class="nombre">${producto.nombre}</p>
      ${codigoDeBarras(producto.sku)}
      <p class="precio">${formatearDinero(producto.precio_venta)}</p>
    </article>
  `;
}

const ESTILOS = `
  @page { margin: 10mm; }
  body { font-family: "Segoe UI", system-ui, sans-serif; margin: 0; color: #111; }
  h1 { font-size: 13px; font-weight: 600; color: #6c757d; margin: 0 0 10px; }
  .hoja { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; }
  .etiqueta {
    border: 1px dashed #cfd4d9;
    border-radius: 6px;
    padding: 6px 8px 8px;
    text-align: center;
    break-inside: avoid;
  }
  .etiqueta .nombre {
    font-size: 11px; font-weight: 600; margin: 0 0 4px;
    height: 26px; overflow: hidden;
  }
  .etiqueta svg { width: 100%; height: auto; }
  .etiqueta .precio { font-size: 15px; font-weight: 700; margin: 2px 0 0; }
  .sin-codigo { font-family: monospace; font-size: 12px; }
  @media print { h1 { display: none; } .etiqueta { border-color: #e9ecef; } }
`;

export function imprimirEtiquetas(productos) {
  const ventana = window.open("", "_blank", "width=980,height=760");
  if (!ventana) return false;
  ventana.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Etiquetas de código de barras</title>
        <style>${ESTILOS}</style>
      </head>
      <body>
        <h1>${productos.length} etiquetas · usa "Guardar como PDF" en el destino de impresión</h1>
        <div class="hoja">${productos.map(etiqueta).join("")}</div>
      </body>
    </html>
  `);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 350);
  return true;
}
