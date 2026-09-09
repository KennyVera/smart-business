import api from "../../../api/client";

const BASE = "/api/pos/gerente";

export function fetchDashboardGerente() {
  return api.get(`${BASE}/dashboard/`);
}

export function fetchCierreDiario() {
  return api.get(`${BASE}/cierre-diario/`);
}

export function fetchAuditoriaCajas(params = {}) {
  return api.get(`${BASE}/auditoria-cajas/`, { params });
}

export function fetchDesgloseTurno(idTurno) {
  return api.get(`${BASE}/auditoria-cajas/${idTurno}/desglose/`);
}

export function marcarTurnoAuditado(idTurno) {
  return api.post(`${BASE}/auditoria-cajas/${idTurno}/auditar/`);
}

export function fetchVentaPorId(idVenta) {
  return api.get(`/api/pos/ventas/${idVenta}/`);
}

export function anularVenta(idVenta) {
  return api.post(`/api/pos/ventas/${idVenta}/anular/`);
}
