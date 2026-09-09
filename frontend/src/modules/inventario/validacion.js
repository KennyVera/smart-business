export const LIMITES = {
  sku: 50,
  nombre: 150,
  categoria: 40,
  codigo_lote: 50,
  motivo: 255,
  ruc: 13,
  telefono: 10,
  contacto: 100,
  email: 100,
  direccion: 255,
  razon_social: 150,
};

const SKU_RE = /^[A-Za-z0-9-]{4,50}$/;
const NOMBRE_RE = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,%°\-/()]{3,150}$/;
const CONTACTO_RE =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const CATEGORIA_RE =
  /^(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,&\-/()]{3,40}$/;
const MOTIVO_RE = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,;:%°\-/()]{5,255}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FILTROS = {
  sku: (valor) => valor.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, LIMITES.sku),
  codigo_lote: (valor) =>
    valor.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, LIMITES.codigo_lote),
  nombre: (valor) =>
    valor.replace(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,%°\-/()]/g, "").slice(0, LIMITES.nombre),
  razon_social: (valor) =>
    valor
      .replace(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,%°\-/()]/g, "")
      .slice(0, LIMITES.razon_social),
  nombre_contacto: (valor) =>
    valor
      .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ '\-]/g, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, LIMITES.contacto),
  categoria: (valor) =>
    valor
      .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,&\-/()]/g, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, LIMITES.categoria),
  motivo: (valor) =>
    valor.replace(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,;:%°\-/()]/g, "").slice(0, LIMITES.motivo),
  ruc: (valor) => valor.replace(/\D/g, "").slice(0, LIMITES.ruc),
  telefono: (valor) => valor.replace(/\D/g, "").slice(0, LIMITES.telefono),
  email: (valor) => valor.replace(/\s/g, "").toLowerCase().slice(0, LIMITES.email),
  direccion: (valor) => valor.slice(0, LIMITES.direccion),
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

export function validarCategoria(nombre) {
  const texto = (nombre || "").trim().replace(/\s{2,}/g, " ");
  if (texto.length < 3) {
    return "La categoría necesita al menos 3 caracteres.";
  }
  if (texto.length > LIMITES.categoria) {
    return `La categoría admite máximo ${LIMITES.categoria} caracteres.`;
  }
  if (!CATEGORIA_RE.test(texto)) {
    return "Usa un nombre claro (letras; números y signos básicos opcionales).";
  }
  if (/^(.)\1+$/.test(texto.replace(/\s/g, ""))) {
    return "El nombre no puede ser un solo carácter repetido.";
  }
  return "";
}

export function validarProducto(form) {
  if (!SKU_RE.test(form.sku)) {
    return "El SKU necesita 4 a 50 caracteres entre letras, números y guiones.";
  }
  if (!NOMBRE_RE.test(form.nombre.trim())) {
    return "El nombre del producto necesita entre 3 y 150 caracteres válidos.";
  }
  if (!form.categoria) return "Selecciona la categoría del producto.";
  if (!form.proveedor) return "Selecciona el proveedor del producto.";
  const costo = Number(form.costo_actual);
  const precio = Number(form.precio_venta);
  if (!Number.isFinite(costo) || costo < 0) return "Registra un costo válido (≥ 0).";
  if (!Number.isFinite(precio) || precio < 0) {
    return "El precio de venta no puede ser negativo.";
  }
  if (precio <= 0) {
    return "El precio de venta debe ser mayor a 0.";
  }
  return "";
}

export function validarProveedor(form) {
  const ruc = form.ruc || "";
  const razon = (form.razon_social || "").trim();
  const contacto = (form.nombre_contacto || "").trim();
  const telefono = form.telefono || "";
  const email = (form.email || "").trim();
  const direccion = (form.direccion || "").trim();

  if (!/^\d{13}$/.test(ruc)) {
    return "El RUC debe tener exactamente 13 dígitos numéricos.";
  }
  if (razon.length < 3 || razon.length > LIMITES.razon_social) {
    return `La razón social admite entre 3 y ${LIMITES.razon_social} caracteres.`;
  }
  if (!NOMBRE_RE.test(razon)) {
    return "La razón social tiene caracteres no permitidos.";
  }
  if (contacto.length < 3 || contacto.length > LIMITES.contacto) {
    return `El contacto admite entre 3 y ${LIMITES.contacto} caracteres.`;
  }
  if (!CONTACTO_RE.test(contacto)) {
    return "El contacto solo admite letras, espacios y guiones.";
  }
  if (!/^\d{10}$/.test(telefono)) {
    return "El teléfono debe tener exactamente 10 dígitos.";
  }
  if (email.length > LIMITES.email || !EMAIL_RE.test(email)) {
    return `Ingresa un correo válido (máx. ${LIMITES.email}).`;
  }
  if (direccion.length < 5 || direccion.length > LIMITES.direccion) {
    return `La dirección admite entre 5 y ${LIMITES.direccion} caracteres.`;
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
