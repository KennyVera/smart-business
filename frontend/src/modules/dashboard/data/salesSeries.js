const MES_CERO = { Lácteos: 0, Bebidas: 0, Abarrotes: 0, Limpieza: 0 };

export const SALES_SERIES = [
  { mes: "Ene", ...MES_CERO },
  { mes: "Feb", ...MES_CERO },
  { mes: "Mar", ...MES_CERO },
  { mes: "Abr", ...MES_CERO },
  { mes: "May", ...MES_CERO },
];

export const SALES_LINES = [
  { key: "Lácteos", color: "#1c1f24" },
  { key: "Bebidas", color: "#6c757d" },
  { key: "Abarrotes", color: "#343a40" },
  { key: "Limpieza", color: "#adb5bd" },
];
