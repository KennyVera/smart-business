import api from "../../../api/client";

export function login(usuario, clave) {
  return api.post("/api/usuarios/login/", { usuario, clave });
}

export function logout() {
  return api.post("/api/usuarios/logout/");
}
