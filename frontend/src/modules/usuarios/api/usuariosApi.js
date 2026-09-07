import api from "../../../api/client";
import { leerPagina, TODOS } from "../../../shared/paginado";

export function fetchUsuarios(params) {
  return api.get("/api/usuarios/usuarios/", { params });
}

export async function fetchRoles() {
  const { data } = await api.get("/api/usuarios/roles/", {
    params: { page_size: TODOS },
  });
  return { data: leerPagina(data).items };
}

/** Alimenta los <select> de sucursal, por eso pide la lista completa. */
export async function fetchSucursalesAsignables() {
  const { data } = await api.get("/api/usuarios/sucursales/", {
    params: { page_size: TODOS },
  });
  return { data: leerPagina(data).items };
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

export function fetchSesiones(idUsuario, params) {
  return api.get(`/api/usuarios/usuarios/${idUsuario}/sesiones/`, { params });
}

export function fetchSesionesResumen() {
  return api.get("/api/usuarios/sesiones/resumen/");
}

export function revocarSesion(idSesion) {
  return api.post(`/api/usuarios/sesiones/${idSesion}/revocar/`);
}
