const CABECERAS_EXPORT = [
  "sku",
  "nombre",
  "categoria",
  "costo_actual",
  "precio_venta",
  "margen_porcentaje",
];

const ALIAS = {
  codigo: "sku",
  "codigo de barras": "sku",
  producto: "nombre",
  categoría: "categoria",
  costo: "costo_actual",
  precio: "precio_venta",
  "precio de venta": "precio_venta",
};

function escapar(valor) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function exportarProductosCsv(productos) {
  const lineas = [CABECERAS_EXPORT.join(",")];
  productos.forEach((producto) => {
    lineas.push(
      [
        producto.sku,
        producto.nombre,
        producto.categoria_nombre,
        producto.costo_actual,
        producto.precio_venta,
        producto.margen_porcentaje ?? "",
      ]
        .map(escapar)
        .join(","),
    );
  });
  descargar(`catalogo-${new Date().toISOString().slice(0, 10)}.csv`, lineas.join("\n"));
}

function descargar(nombre, contenido) {
  const blob = new Blob([`\ufeff${contenido}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

function partirLinea(linea, separador) {
  const celdas = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < linea.length; i += 1) {
    const caracter = linea[i];
    if (caracter === '"') {
      if (entreComillas && linea[i + 1] === '"') {
        actual += '"';
        i += 1;
      } else {
        entreComillas = !entreComillas;
      }
    } else if (caracter === separador && !entreComillas) {
      celdas.push(actual);
      actual = "";
    } else {
      actual += caracter;
    }
  }
  celdas.push(actual);
  return celdas.map((celda) => celda.trim());
}

function normalizar(cabecera) {
  const limpia = cabecera.trim().toLowerCase().replace(/^\ufeff/, "");
  return ALIAS[limpia] || limpia;
}

export function leerProductosCsv(texto) {
  const lineas = texto
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);
  if (lineas.length < 2) return [];
  const separador = lineas[0].includes(";") ? ";" : ",";
  const cabeceras = partirLinea(lineas[0], separador).map(normalizar);
  return lineas.slice(1).map((linea) => {
    const celdas = partirLinea(linea, separador);
    return cabeceras.reduce((fila, cabecera, indice) => {
      fila[cabecera] = celdas[indice] ?? "";
      return fila;
    }, {});
  });
}
