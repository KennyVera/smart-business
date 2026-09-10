import api from "../../../api/client";
import { leerPagina, TODOS } from "../../../shared/paginado";

const BASE = "/api/pos";

export function fetchTurnoActual() {
  return api.get(`${BASE}/turnos/actual/`);
}

export function abrirTurno(payload) {
  return api.post(`${BASE}/turnos/abrir/`, payload);
}

export function cerrarTurno(idTurno, payload) {
  return api.post(`${BASE}/turnos/${idTurno}/cerrar/`, payload);
}

/** Grilla visual: solo productos con InventarioStock en la sucursal del cajero. */
export function fetchCatalogoLocal(params) {
  return api.get(`${BASE}/catalogo-local/`, { params });
}

/** Compat: mismo criterio que catalogo-local. */
export function fetchCatalogo(params) {
  return fetchCatalogoLocal(params);
}

/** Pistola / buscador de texto: catálogo global de la empresa + stock local. */
export function fetchCatalogoGlobal(params) {
  return api.get(`${BASE}/catalogo-global/`, { params });
}

/** Las pills de categoría necesitan la lista completa, no una página. */
export async function fetchCategoriasPos() {
  const { data } = await api.get(`${BASE}/categorias/`, {
    params: { page_size: TODOS },
  });
  return { data: leerPagina(data).items };
}

export async function fetchMetodosPago() {
  const { data } = await api.get(`${BASE}/metodos-pago/`, {
    params: { page_size: TODOS },
  });
  return { data: leerPagina(data).items };
}

export async function fetchClientePorCedula(cedula) {
  try {
    const { data } = await api.get(`/api/crm/clientes/${cedula}/`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export function crearCliente(payload) {
  return api.post("/api/crm/clientes/", payload);
}

export async function buscarCliente(cedula) {
  return fetchClientePorCedula(cedula);
}

export function procesarVenta(payload) {
  return api.post(`${BASE}/ventas/procesar/`, payload);
}
