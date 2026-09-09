import { inicioDeRol, rolDeSesion } from "./auth/sesion";

export const ROL = {
  ADMIN: "administrador",
  GERENTE: "gerente",
  BODEGUERO: "bodeguero",
  CAJERO: "cajero",
};

/** Catálogo / categorías / stock (escritura operativa). */
export const ROLES_INVENTARIO_OPS = [ROL.ADMIN, ROL.BODEGUERO];

/** Dashboard gerencial, auditoría, devoluciones. */
export const ROLES_GERENCIAL = [ROL.ADMIN, ROL.GERENTE];

/** Alertas y reportes de inventario (lectura compartida). */
export const ROLES_INVENTARIO_LECTURA = [ROL.ADMIN, ROL.GERENTE, ROL.BODEGUERO];

export const ROLES_ADMIN = [ROL.ADMIN];
export const ROLES_POS = [ROL.CAJERO, ROL.ADMIN, ROL.GERENTE];

export function tieneRol(roles, rol = rolDeSesion()) {
  return roles.includes(rol);
}

export function puedeOperarInventario(rol = rolDeSesion()) {
  return tieneRol(ROLES_INVENTARIO_OPS, rol);
}

export function puedeVerGerencial(rol = rolDeSesion()) {
  return tieneRol(ROLES_GERENCIAL, rol);
}

export function puedeVerAlertasReportes(rol = rolDeSesion()) {
  return tieneRol(ROLES_INVENTARIO_LECTURA, rol);
}

export function destinoSeguro(rol = rolDeSesion()) {
  return inicioDeRol(rol);
}

export const MSG_ACCESO_DENEGADO = "Acceso denegado";
