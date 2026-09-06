import { AlertTriangle, CalendarClock, ShieldAlert } from "lucide-react";

function AlertasResumen({ resumen, dias }) {
  const tarjetas = [
    {
      clave: "criticos",
      icono: ShieldAlert,
      valor: resumen.criticos,
      titulo: "Bajo mínimo",
      detalle: "Productos que hay que reponer",
      tono: "critico",
    },
    {
      clave: "por_caducar",
      icono: CalendarClock,
      valor: resumen.por_caducar,
      titulo: `Vencen en ${dias} días`,
      detalle: "Lotes para rotar o promocionar",
      tono: "bajo",
    },
    {
      clave: "vencidos",
      icono: AlertTriangle,
      valor: resumen.vencidos,
      titulo: "Ya vencidos",
      detalle: "Retirar de estantería y dar de baja",
      tono: "critico",
    },
  ];

  return (
    <div className="inv-resumen">
      {tarjetas.map(({ clave, icono: Icono, valor, titulo, detalle, tono }) => (
        <div key={clave} className={`inv-resumen-item is-${tono}`}>
          <Icono size={18} strokeWidth={1.75} />
          <strong>{valor}</strong>
          <span>{titulo}</span>
          <small>{detalle}</small>
        </div>
      ))}
    </div>
  );
}

export default AlertasResumen;
