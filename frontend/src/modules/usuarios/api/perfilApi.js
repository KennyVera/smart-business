import api from "../../../api/client";

export function fetchMiPerfil() {
  return api.get("/api/usuarios/me/");
}

export function actualizarMiPerfil(payload) {
  if (payload.foto_perfil instanceof File) {
    return api.patch("/api/usuarios/me/", aFormData(payload));
  }
  return api.patch("/api/usuarios/me/", payload);
}

export function cambiarMiClave(payload) {
  return api.post("/api/usuarios/me/change-password/", payload);
}

function aFormData(payload) {
  const datos = new FormData();
  Object.entries(payload).forEach(([clave, valor]) => {
    if (valor === null || valor === undefined) return;
    if (valor === "" && clave !== "correo") return;
    datos.append(clave, valor === null ? "" : valor);
  });
  return datos;
}
