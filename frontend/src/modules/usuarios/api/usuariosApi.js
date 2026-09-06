import api from "../../../api/client";

export function fetchUsuarios() {
  return api.get("/api/usuarios/usuarios/");
}

export function fetchRoles() {
  return api.get("/api/usuarios/roles/");
}

export function fetchSucursalesAsignables() {
  return api.get("/api/usuarios/sucursales/");
}

export function createUsuario(payload) {
  return api.post("/api/usuarios/usuarios/", payload);
}

export function updateUsuario(id, payload) {
  return api.patch(`/api/usuarios/usuarios/${id}/`, payload);
}

export function desactivarUsuario(id) {
  return api.post(`/api/usuarios/usuarios/${id}/desactivar/`);
}

export function restablecerClave(id) {
  return api.post(`/api/usuarios/usuarios/${id}/restablecer-clave/`);
}

export function fetchSesiones(idUsuario) {
  return api.get(`/api/usuarios/usuarios/${idUsuario}/sesiones/`);
}

export function fetchSesionesResumen() {
  return api.get("/api/usuarios/sesiones/resumen/");
}

export function revocarSesion(idSesion) {
  return api.post(`/api/usuarios/sesiones/${idSesion}/revocar/`);
}
