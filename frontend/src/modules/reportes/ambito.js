/** Misma regla que el backend: solo preguntas del sistema Smart Business. */
export const MSG_SOLO_SISTEMA =
  "Solo puedo ofrecer información del sistema Smart Business (ventas, inventario, clientes, sucursales y reportes). Reformula tu pregunta sobre esos datos.";

const PALABRAS_NEGOCIO = [
  "venta",
  "vendid",
  "vender",
  "cliente",
  "producto",
  "stock",
  "inventario",
  "sucursal",
  "caja",
  "turno",
  "cajero",
  "factura",
  "ticket",
  "iva",
  "pago",
  "cobro",
  "reporte",
  "ranking",
  "gastad",
  "comprad",
  "compra",
  "kardex",
  "merma",
  "proveedor",
  "categor",
  "sku",
  "barcode",
  "código de barra",
  "codigo de barra",
  "ingreso",
  "utilidad",
  "margen",
  "bodega",
  "almacén",
  "almacen",
  "pedido",
  "devoluci",
  "arqueo",
  "descuadre",
  "punto",
  "crm",
  "pos",
  "erp",
  "negocio",
  "tienda",
  "local",
];

const FUERA_OBVIO =
  /\b(cu[aá]nto\s+es|cuanto\s+es|calcul[ae]|resuelve|matem[aá]tica|chiste|acertijo|receta|clima|mam[aá]|pap[aá]|\bamor\b|te\s+amo|me\s+ama|traduce|poema|canci[oó]n|capital\s+de|presidente\s+de|\bhola\b|como\s+est[aá]s|qui[eé]n\s+eres)\b/i;

const SOLO_MATH = /^[\d\s+\-*/x×().=?¿!¡]+$/i;

export function esFueraDeAmbito(prompt) {
  const texto = (prompt || "").trim();
  if (!texto) return true;
  if (FUERA_OBVIO.test(texto)) return true;
  if (SOLO_MATH.test(texto)) return true;
  const bajo = texto.toLowerCase();
  return !PALABRAS_NEGOCIO.some((p) => bajo.includes(p));
}
