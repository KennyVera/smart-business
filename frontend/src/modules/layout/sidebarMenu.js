import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  MapPinned,
  Package,
  RotateCcw,
  Store,
  Tags,
  Users,
} from "lucide-react";
import {
  ROLES_ADMIN,
  ROLES_GERENCIAL,
  ROLES_INVENTARIO_LECTURA,
  ROLES_INVENTARIO_OPS,
} from "../usuarios/rbac";

/** Menú del sidebar administrativo agrupado por módulo RBAC. */
export const SIDEBAR_MODULOS = [
  {
    id: "admin",
    titulo: "Administración",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, roles: ROLES_ADMIN },
      { to: "/geografia/zonas", label: "Zonas", icon: MapPinned, roles: ROLES_ADMIN },
      { to: "/geografia/sucursales", label: "Sucursales", icon: Store, roles: ROLES_ADMIN },
      { to: "/usuarios", label: "Usuarios", icon: Users, roles: ROLES_ADMIN },
    ],
  },
  {
    id: "gerencial",
    titulo: "Gerencial",
    items: [
      {
        to: "/gerente",
        label: "Dashboard",
        icon: LayoutDashboard,
        end: true,
        roles: ROLES_GERENCIAL,
      },
      {
        to: "/gerente/auditoria",
        label: "Auditoría cajas",
        icon: ClipboardCheck,
        roles: ROLES_GERENCIAL,
      },
      {
        to: "/gerente/devoluciones",
        label: "Devoluciones",
        icon: RotateCcw,
        roles: ROLES_GERENCIAL,
      },
      {
        to: "/gerente/clientes",
        label: "Clientes",
        icon: Users,
        roles: ROLES_GERENCIAL,
      },
    ],
  },
  {
    id: "inventario",
    titulo: "Inventario",
    items: [
      {
        to: "/inventario/catalogo",
        label: "Catálogo",
        icon: Package,
        roles: ROLES_INVENTARIO_OPS,
      },
      {
        to: "/inventario/categorias",
        label: "Categorías",
        icon: Tags,
        roles: ROLES_INVENTARIO_OPS,
      },
      {
        to: "/inventario/stock",
        label: "Stock",
        icon: Boxes,
        roles: ROLES_INVENTARIO_OPS,
      },
    ],
  },
  {
    id: "compartido",
    titulo: "Consultas",
    items: [
      {
        to: "/inventario/alertas",
        label: "Alertas",
        icon: AlertTriangle,
        roles: ROLES_INVENTARIO_LECTURA,
      },
      {
        to: "/inventario/reportes",
        label: "Reportes",
        icon: FileBarChart,
        roles: ROLES_INVENTARIO_LECTURA,
      },
    ],
  },
];

/** True si algún ítem del grupo coincide con la ruta actual. */
export function grupoContieneRuta(items, pathname) {
  return items.some((item) => {
    if (item.end) return pathname === item.to;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });
}
