import api from "../../../api/client";

const BASE = "/api/pos/gerente/clientes";

export function fetchClientesGerente(params = {}) {
  return api.get(`${BASE}/`, { params });
}

export function fetchClienteGerente(id) {
  return api.get(`${BASE}/${id}/`);
}

export function patchClienteGerente(id, payload) {
  return api.patch(`${BASE}/${id}/`, payload);
}

export function exportarClientesGerente(params = {}) {
  return api.get(`${BASE}/exportar/`, {
    params,
    responseType: "blob",
  });
}
