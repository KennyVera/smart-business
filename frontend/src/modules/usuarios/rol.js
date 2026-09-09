export function esRolAdmin(idRol, roles) {
  const hallado = roles.find((item) => String(item.id_rol) === String(idRol));
  return (hallado?.nombre || "").trim().toLowerCase() === "administrador";
}

export function mensajeApi(error, respaldo) {
  const data = error?.response?.data;
  if (!data) return respaldo;
  if (typeof data === "string") {
    const texto = data.trim();
    if (!texto || texto.startsWith("<")) return respaldo;
    return texto.slice(0, 220);
  }
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return String(data.detail[0] || respaldo);
  const primero = Object.values(data)[0];
  if (Array.isArray(primero)) return String(primero[0] || respaldo);
  if (typeof primero === "string") return primero;
  return respaldo;
}
