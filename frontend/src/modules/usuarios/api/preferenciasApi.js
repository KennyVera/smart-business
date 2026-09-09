import api from "../../../api/client";

export function fetchMisPreferencias() {
  return api.get("/api/usuarios/preferencias/me/");
}

export function actualizarMisPreferencias(payload) {
  if (payload.logo_personalizado instanceof File) {
    return api.patch("/api/usuarios/preferencias/me/", aFormData(payload));
  }
  return api.patch("/api/usuarios/preferencias/me/", payload);
}

function aFormData(payload) {
  const datos = new FormData();
  Object.entries(payload).forEach(([clave, valor]) => {
    if (valor === null || valor === undefined) return;
    datos.append(clave, valor);
  });
  return datos;
}
