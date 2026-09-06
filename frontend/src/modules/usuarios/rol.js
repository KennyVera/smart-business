export function esRolAdmin(idRol, roles) {
  const hallado = roles.find((item) => String(item.id_rol) === String(idRol));
  return (hallado?.nombre || "").trim().toLowerCase() === "administrador";
}

export function mensajeApi(error, respaldo) {
  const data = error?.response?.data;
  if (!data) return respaldo;
  if (typeof data.detail === "string") return data.detail;
  const primero = Object.values(data)[0];
  if (Array.isArray(primero)) return primero[0];
  if (typeof primero === "string") return primero;
  return respaldo;
}
