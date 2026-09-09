import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  actualizarMisPreferencias,
  fetchMisPreferencias,
} from "../modules/usuarios/api/preferenciasApi";
import ConfirmHost from "../shared/ConfirmHost";

const DEFECTO = {
  colorSidebar: "#000000",
  colorGraficos: "#00aa5d",
  colorLogs: "#00aa5d",
  logoPersonalizado: null,
  filasPorPagina: 10,
};

/** <input type="color"> solo acepta #rrggbb en minúsculas de forma fiable. */
export function normalizarHex(valor, defecto) {
  const crudo = String(valor || "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(crudo)) return crudo.toLowerCase();
  return defecto;
}

const PreferencesContext = createContext({
  ...DEFECTO,
  listo: false,
  updatePreferences: async () => {},
});

function mapear(data) {
  return {
    colorSidebar: normalizarHex(data.color_sidebar, DEFECTO.colorSidebar),
    colorGraficos: normalizarHex(data.color_graficos, DEFECTO.colorGraficos),
    colorLogs: normalizarHex(data.color_logs, DEFECTO.colorLogs),
    logoPersonalizado: data.logo_personalizado || null,
    filasPorPagina: Number(data.filas_por_pagina) || DEFECTO.filasPorPagina,
  };
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(DEFECTO);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetchMisPreferencias()
      .then(({ data }) => {
        if (vivo) setPrefs(mapear(data));
      })
      .catch(() => {
        if (vivo) setPrefs(DEFECTO);
      })
      .finally(() => {
        if (vivo) setListo(true);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const updatePreferences = useCallback(async (cambios) => {
    const { data } = await actualizarMisPreferencias(cambios);
    const siguiente = mapear(data);
    setPrefs(siguiente);
    return siguiente;
  }, []);

  const valor = useMemo(
    () => ({ ...prefs, listo, updatePreferences }),
    [prefs, listo, updatePreferences],
  );

  return (
    <PreferencesContext.Provider value={valor}>
      {children}
    </PreferencesContext.Provider>
  );
}

/** Layout route: envuelve rutas autenticadas con el provider. */
export function PreferencesLayout() {
  return (
    <PreferencesProvider>
      <Outlet />
      <ConfirmHost />
    </PreferencesProvider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

export function useFilasPorPagina() {
  const { filasPorPagina } = usePreferences();
  return filasPorPagina || DEFECTO.filasPorPagina;
}
