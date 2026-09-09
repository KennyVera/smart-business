const CLAVE_SESION = "sb_sesion";

function almacen(recordar) {
  return recordar ? localStorage : sessionStorage;
}

export function leerSesion() {
  const crudo = sessionStorage.getItem(CLAVE_SESION) || localStorage.getItem(CLAVE_SESION);
  if (!crudo) return null;
  try {
    const data = JSON.parse(crudo);
    if (!data?.access_token || !data?.id_usuario) return null;
    return data;
  } catch {
    return null;
  }
}

export function guardarSesion(usuario, recordar) {
  const destino = almacen(recordar);
  const otro = recordar ? sessionStorage : localStorage;
  otro.removeItem(CLAVE_SESION);
  destino.setItem(CLAVE_SESION, JSON.stringify(usuario));
}

/** Actualiza campos del perfil en la sesión sin perder el token. */
export function actualizarSesion(cambios) {
  const actual = leerSesion();
  if (!actual) return null;
  const enLocal = Boolean(localStorage.getItem(CLAVE_SESION));
  const siguiente = { ...actual, ...cambios };
  guardarSesion(siguiente, enLocal);
  return siguiente;
}

export function borrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  localStorage.removeItem(CLAVE_SESION);
}

/** Normaliza "Gerente de Sucursal" → gerente, etc. */
export function rolDeSesion() {
  const crudo = (leerSesion()?.rol_nombre || "").trim().toLowerCase();
  for (const clave of ["administrador", "gerente", "cajero", "bodeguero"]) {
    if (crudo.includes(clave)) return clave;
  }
  return crudo;
}

export function inicioDeRol(rol = rolDeSesion()) {
  if (rol === "cajero") return "/pos";
  if (rol === "bodeguero") return "/inventario/alertas";
  if (rol === "gerente") return "/gerente";
  return "/";
}

export function iniciales(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}
