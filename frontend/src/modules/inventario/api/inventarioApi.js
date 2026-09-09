import api from "../../../api/client";
import { leerPagina, TODOS } from "../../../shared/paginado";

const BASE = "/api/inventario";

export function fetchCategorias(params) {
  return api.get(`${BASE}/categorias/`, { params });
}

export function fetchProveedores(params) {
  return api.get(`${BASE}/proveedores/`, { params });
}

/** Para los <select>: catálogo de proveedores sin paginar. */
export async function fetchProveedoresTodos() {
  const { data } = await api.get(`${BASE}/proveedores/`, {
    params: { page_size: TODOS },
  });
  return { data: leerPagina(data).items };
}

export function createProveedor(payload) {
  return api.post(`${BASE}/proveedores/`, payload);
}

export function updateProveedor(id, payload) {
  return api.patch(`${BASE}/proveedores/${id}/`, payload);
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
  if (payload.imagen instanceof File) {
    return api.post(`${BASE}/productos/`, aFormData(payload));
  }
  return api.post(`${BASE}/productos/`, payload);
}

export function updateProducto(id, payload) {
  if (payload.imagen instanceof File) {
    return api.patch(`${BASE}/productos/${id}/`, aFormData(payload));
  }
  return api.patch(`${BASE}/productos/${id}/`, payload);
}

function aFormData(payload) {
  const datos = new FormData();
  Object.entries(payload).forEach(([clave, valor]) => {
    if (valor === null || valor === undefined || valor === "") return;
    if (typeof valor === "boolean") {
      datos.append(clave, valor ? "true" : "false");
      return;
    }
    datos.append(clave, valor);
  });
  return datos;
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

export function fetchReporteClientesCrm(params) {
  return api.get("/api/crm/reportes/clientes/", { params });
}
