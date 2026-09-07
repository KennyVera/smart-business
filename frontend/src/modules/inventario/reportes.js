import { PackageX, ShoppingCart, TrendingDown, Wallet } from "lucide-react";
import { formatearDinero } from "./margen";

const SKU = { clave: "sku", etiqueta: "SKU", tipo: "sku" };
const PRODUCTO = { clave: "producto", etiqueta: "Producto", tipo: "nombre" };
const CATEGORIA = { clave: "categoria", etiqueta: "Categoría", tipo: "chip" };
const SUCURSAL = { clave: "sucursal", etiqueta: "Sucursal", multi: true };

export const VERDE = "#00AA5D";
export const PALETA = [
  "#00AA5D",
  "#0F5132",
  "#7FD1A6",
  "#F5A524",
  "#E8663D",
  "#4C6EF5",
  "#868E96",
];

export const REPORTES = [
  {
    clave: "valorizado",
    ruta: "valorizado",
    titulo: "Inventario valorizado",
    detalle:
      "Cuánto dinero tienes parado en bodega, al costo y a precio de venta, repartido por categoría.",
    icono: Wallet,
    grafico: { tipo: "barras", titulo: "Capital al costo por categoría", medida: "dinero" },
    columnas: [
      SKU,
      PRODUCTO,
      CATEGORIA,
      SUCURSAL,
      { clave: "cantidad", etiqueta: "Cant.", tipo: "numero" },
      { clave: "costo_unitario", etiqueta: "Costo u.", tipo: "dinero" },
      { clave: "costo_total", etiqueta: "Total costo", tipo: "dinero", fuerte: true },
      { clave: "venta_total", etiqueta: "Total venta", tipo: "dinero" },
    ],
  },
  {
    clave: "mermas",
    ruta: "mermas",
    titulo: "Análisis de mermas",
    detalle:
      "Qué se está perdiendo y por qué, en el rango de fechas que elijas. Ideal para cerrar fugas.",
    icono: TrendingDown,
    filtros: "fechas",
    grafico: { tipo: "pastel", titulo: "Pérdida al costo por motivo", medida: "dinero" },
    columnas: [
      { clave: "fecha", etiqueta: "Fecha", tipo: "fecha" },
      SKU,
      PRODUCTO,
      SUCURSAL,
      { clave: "motivo", etiqueta: "Motivo" },
      { clave: "cantidad", etiqueta: "Cant.", tipo: "numero" },
      { clave: "costo_total", etiqueta: "Pérdida", tipo: "dinero", fuerte: true },
      { clave: "usuario", etiqueta: "Registró" },
    ],
  },
  {
    clave: "stock-muerto",
    ruta: "stock-muerto",
    titulo: "Stock muerto / sin rotación",
    detalle:
      "Productos con existencias que no registran salidas en el periodo. Capital dormido en la percha.",
    icono: PackageX,
    filtros: "dias",
    grafico: { tipo: "barras", titulo: "Capital inmovilizado por categoría", medida: "dinero" },
    columnas: [
      SKU,
      PRODUCTO,
      CATEGORIA,
      SUCURSAL,
      { clave: "cantidad", etiqueta: "Cant.", tipo: "numero" },
      { clave: "dias_sin_salida", etiqueta: "Días sin salida", tipo: "numero" },
      { clave: "capital", etiqueta: "Capital", tipo: "dinero", fuerte: true },
    ],
  },
  {
    clave: "sugerido-compras",
    ruta: "sugerido-compras",
    titulo: "Sugerido de compras",
    detalle:
      "Lo que está bajo el mínimo y cuánto pedir para volver al doble del stock mínimo.",
    icono: ShoppingCart,
    grafico: { tipo: "barras", titulo: "Inversión sugerida por categoría", medida: "dinero" },
    columnas: [
      SKU,
      PRODUCTO,
      CATEGORIA,
      SUCURSAL,
      { clave: "cantidad", etiqueta: "Actual", tipo: "numero" },
      { clave: "stock_minimo", etiqueta: "Mínimo", tipo: "numero" },
      { clave: "sugerido", etiqueta: "Pedir", tipo: "numero", fuerte: true },
      { clave: "inversion", etiqueta: "Inversión", tipo: "dinero" },
    ],
  },
];

export const VENTANAS_ROTACION = [
  { valor: 30, etiqueta: "Sin salidas hace 30 días o más" },
  { valor: 60, etiqueta: "Sin salidas hace 60 días o más" },
  { valor: 90, etiqueta: "Sin salidas hace 90 días o más" },
  { valor: 0, etiqueta: "Todo lo que nunca ha salido" },
];

export function buscarReporte(clave) {
  return REPORTES.find((reporte) => reporte.clave === clave) || null;
}

export function columnasVisibles(reporte, multiSucursal) {
  return reporte.columnas.filter((columna) => multiSucursal || !columna.multi);
}

export function formatearValor(valor, tipo) {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (tipo === "dinero") return formatearDinero(valor);
  return String(valor);
}

export function alineado(tipo) {
  return tipo === "dinero" || tipo === "numero";
}

export function rangoPorDefecto(dias = 30) {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  return { desde: iso(desde), hasta: iso(hasta) };
}

export function iso(fecha) {
  return fecha.toISOString().slice(0, 10);
}

export function parametrosDe(reporte, filtros) {
  const params = {};
  if (filtros.sucursal) params.sucursal = filtros.sucursal;
  if (reporte.filtros === "fechas") {
    params.start_date = filtros.desde;
    params.end_date = filtros.hasta;
  }
  if (reporte.filtros === "dias") params.dias = filtros.dias;
  return params;
}

export function alcanceDe(reporte, datos, sucursal) {
  const partes = [sucursal ? `Sucursal: ${sucursal}` : "Todas las sucursales"];
  if (datos?.periodo) {
    partes.push(`Periodo: ${fechaCorta(datos.periodo.desde)} a ${fechaCorta(datos.periodo.hasta)}`);
  }
  if (datos?.dias === 0) partes.push("Sin salidas en todo el histórico");
  else if (datos?.dias !== undefined) partes.push(`Sin salidas hace ${datos.dias} días o más`);
  partes.push(`${datos?.filas?.length || 0} registros`);
  return partes.join("  ·  ");
}

function fechaCorta(texto) {
  const [anio, mes, dia] = String(texto).split("-");
  return `${dia}/${mes}/${anio}`;
}
