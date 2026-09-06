import axios from "axios";
import { borrarSesion, leerSesion } from "../modules/usuarios/auth/sesion";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const sesion = leerSesion();
  if (sesion?.access_token) {
    config.headers.Authorization = `Bearer ${sesion.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const status = error.response?.status;
    const esLogin = String(error.config?.url || "").includes("/login/");
    if (status === 401 && !esLogin) {
      borrarSesion();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
