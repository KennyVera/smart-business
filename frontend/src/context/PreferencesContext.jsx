import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  actualizarMisPreferencias,
  fetchMisPreferencias,
} from "../modules/usuarios/api/preferenciasApi";
import ConfirmHost from "../shared/ConfirmHost";

const DEFECTO = {
  colorSidebar: "#000000",
  colorGraficos: "#00AA5D",
  colorLogs: "#00AA5D",
  logoPersonalizado: null,
  filasPorPagina: 10,
};

const PreferencesContext = createContext({
  ...DEFECTO,
  listo: false,
  updatePreferences: async () => {},
});

function mapear(data) {
  return {
    colorSidebar: data.color_sidebar || DEFECTO.colorSidebar,
    colorGraficos: data.color_graficos || DEFECTO.colorGraficos,
    colorLogs: data.color_logs || DEFECTO.colorLogs,
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
