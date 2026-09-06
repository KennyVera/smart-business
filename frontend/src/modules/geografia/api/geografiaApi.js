import api from "../../../api/client";

export function fetchZonas() {
  return api.get("/api/geografia/zonas/");
}

export function fetchCantones() {
  return api.get("/api/geografia/cantones/");
}

export function fetchSucursales() {
  return api.get("/api/geografia/sucursales/");
}

export function createSucursal(payload) {
  return api.post("/api/geografia/sucursales/", payload);
}

export function updateSucursal(id, payload) {
  return api.patch(`/api/geografia/sucursales/${id}/`, payload);
}

export function desactivarSucursal(id) {
  return api.post(`/api/geografia/sucursales/${id}/desactivar/`);
}

export function fetchSucursalDetalle(id) {
  return api.get(`/api/geografia/sucursales/${id}/detalle/`);
}
