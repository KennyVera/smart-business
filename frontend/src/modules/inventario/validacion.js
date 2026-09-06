export const LIMITES = {
  sku: 50,
  nombre: 150,
  categoria: 100,
  codigo_lote: 50,
  motivo: 255,
};

const SKU_RE = /^[A-Za-z0-9-]{4,50}$/;
const NOMBRE_RE = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,%°\-/()]{3,150}$/;
const MOTIVO_RE = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,;:%°\-/()]{5,255}$/;

const FILTROS = {
  sku: (valor) => valor.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, LIMITES.sku),
  codigo_lote: (valor) =>
    valor.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, LIMITES.codigo_lote),
  nombre: (valor) =>
    valor.replace(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,%°\-/()]/g, "").slice(0, LIMITES.nombre),
  motivo: (valor) =>
    valor.replace(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,;:%°\-/()]/g, "").slice(0, LIMITES.motivo),
  costo_actual: (valor) => valor.replace(/[^0-9.]/g, "").slice(0, 10),
  precio_venta: (valor) => valor.replace(/[^0-9.]/g, "").slice(0, 10),
  cantidad: (valor) => valor.replace(/[^0-9]/g, "").slice(0, 6),
  stock_minimo: (valor) => valor.replace(/[^0-9]/g, "").slice(0, 6),
  cantidad_actual: (valor) => valor.replace(/[^0-9]/g, "").slice(0, 6),
};

export function filtrarCampo(campo, valor) {
  const filtro = FILTROS[campo];
  return filtro ? filtro(valor) : valor;
}

export function validarProducto(form) {
  if (!SKU_RE.test(form.sku)) {
    return "El SKU necesita 4 a 50 caracteres entre letras, números y guiones.";
  }
  if (!NOMBRE_RE.test(form.nombre.trim())) {
    return "El nombre del producto necesita entre 3 y 150 caracteres válidos.";
  }
  if (!form.categoria) return "Selecciona la categoría del producto.";
  const costo = Number(form.costo_actual);
  const precio = Number(form.precio_venta);
  if (!Number.isFinite(costo) || costo < 0) return "Registra un costo válido.";
  if (!Number.isFinite(precio) || precio <= 0) {
    return "El precio de venta debe ser mayor a 0.";
  }
  return "";
}

export function validarMerma(form) {
  const cantidad = Number(form.cantidad);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return "Indica cuántas unidades se dan de baja.";
  }
  if (!MOTIVO_RE.test(form.motivo.trim())) {
    return "Describe el motivo con 5 a 255 caracteres.";
  }
  return "";
}

export function validarLote(form) {
  if (!form.producto) return "Selecciona el producto del lote.";
  if (!SKU_RE.test(form.codigo_lote)) {
    return "El código de lote necesita 4 a 50 caracteres válidos.";
  }
  if (!form.fecha_vencimiento) return "Indica la fecha de vencimiento.";
  const cantidad = Number(form.cantidad);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return "Indica las unidades que ingresan.";
  }
  return "";
}
