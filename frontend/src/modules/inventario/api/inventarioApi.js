import api from "../../../api/client";
import { leerPagina, TODOS } from "../../../shared/paginado";

const BASE = "/api/inventario";

export function fetchCategorias(params) {
  return api.get(`${BASE}/categorias/`, { params });
}

/** Para los <select>: trae el catálogo de categorías sin paginar. */
export async function fetchCategoriasTodas() {
  const { data } = await api.get(`${BASE}/categorias/`, {
    params: { page_size: TODOS },
  });
  return { data: leerPagina(data).items };
}

export function createCategoria(payload) {
  return api.post(`${BASE}/categorias/`, payload);
}

export function updateCategoria(id, payload) {
  return api.patch(`${BASE}/categorias/${id}/`, payload);
}

export function fetchProductos(params) {
  return api.get(`${BASE}/productos/`, { params });
}

export function createProducto(payload) {
  return api.post(`${BASE}/productos/`, payload);
}

export function updateProducto(id, payload) {
  return api.patch(`${BASE}/productos/${id}/`, payload);
}

export function fetchKardex(idProducto, params) {
  return api.get(`${BASE}/productos/${idProducto}/kardex/`, { params });
}

export function fetchStock(params) {
  return api.get(`${BASE}/stock/`, { params });
}

export function ajustarStock(payload) {
  return api.post(`${BASE}/stock/ajustar/`, payload);
}

export function fetchLotes(params) {
  return api.get(`${BASE}/lotes/`, { params });
}

export function createLote(payload) {
  return api.post(`${BASE}/lotes/`, payload);
}

export function fetchMermas(params) {
  return api.get(`${BASE}/mermas/`, { params });
}

export function createMerma(payload) {
  return api.post(`${BASE}/mermas/`, payload);
}

export function fetchAlertas(params) {
  return api.get(`${BASE}/alertas/`, { params });
}

export function fetchReporte(ruta, params) {
  return api.get(`${BASE}/reportes/${ruta}/`, { params });
}
