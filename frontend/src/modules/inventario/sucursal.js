import { leerSesion } from "../usuarios/auth/sesion";

/**
 * El backend fija la sucursal de quien tiene una asignada (bodeguero, cajero,
 * gerente). El administrador central no tiene sucursal y debe elegirla.
 */
export function sucursalDeSesion() {
  const sesion = leerSesion();
  if (!sesion?.sucursal) return null;
  return { id: sesion.sucursal, nombre: sesion.sucursal_nombre || "Mi sucursal" };
}
