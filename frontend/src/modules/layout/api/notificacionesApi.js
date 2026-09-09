import api from "../../../api/client";

export function fetchNotificaciones() {
  return api.get("/api/notificaciones/");
}

export function marcarNotificacionLeida(id) {
  return api.post(`/api/notificaciones/${id}/leer/`);
}
