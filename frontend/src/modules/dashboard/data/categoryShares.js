export const CATEGORY_SHARES = [
  { name: "Electrónica", value: 0, color: "#1c1f24" },
  { name: "Muebles", value: 0, color: "#6c757d" },
  { name: "Juguetes", value: 0, color: "#d3d3d3" },
];

export function pieSlices(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total > 0) return items;
  return [{ name: "Sin datos", value: 1, color: "#eceff1" }];
}
