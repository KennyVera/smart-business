import api from "../../../api/client";
import { leerSesion } from "../../usuarios/auth/sesion";

const BASE = "/api/reportes-ia";

export function generarReporteIA(prompt_usuario) {
  return api.post(`${BASE}/inteligente/`, { prompt_usuario });
}

export function fetchHistorialReportesIA(params) {
  return api.get(`${BASE}/historial/`, { params });
}

export function fetchHistorialReporteIA(id) {
  return api.get(`${BASE}/historial/${id}/`);
}

export function eliminarHistorialReporteIA(id) {
  return api.delete(`${BASE}/historial/${id}/`);
}

/** Descarga el PDF autenticado del historial. */
export async function descargarPdfHistorialReporteIA(id) {
  const sesion = leerSesion();
  const response = await api.get(`${BASE}/historial/${id}/pdf/`, {
    responseType: "blob",
    headers: sesion?.access_token
      ? { Authorization: `Bearer ${sesion.access_token}` }
      : undefined,
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `reporte-ia-${id}.pdf`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}
