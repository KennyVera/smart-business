import api from "../../../api/client";
import { leerPagina, TODOS } from "../../../shared/paginado";

export function fetchZonas(params) {
  return api.get("/api/geografia/zonas/", { params });
}

/** Los formularios necesitan todos los cantones para su <select>. */
export async function fetchCantones() {
  const { data } = await api.get("/api/geografia/cantones/", {
    params: { page_size: TODOS },
  });
  return { data: leerPagina(data).items };
}

export function fetchSucursales(params) {
  return api.get("/api/geografia/sucursales/", { params });
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
