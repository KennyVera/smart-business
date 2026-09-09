function dinero(valor) {
  const n = Number(valor) || 0;
  return `$ ${n.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function KpisCierre({ cierre }) {
  if (!cierre) return null;
  const items = [
    { label: "Tickets", valor: cierre.tickets ?? 0 },
    { label: "Base IVA 0%", valor: dinero(cierre.subtotal_iva_0) },
    { label: "Base IVA 15%", valor: dinero(cierre.subtotal_iva_15) },
    { label: "IVA", valor: dinero(cierre.monto_iva) },
    { label: "Total día", valor: dinero(cierre.total), fuerte: true },
  ];
  return (
    <div className="row g-3 mb-3">
      {items.map((item) => (
        <div key={item.label} className="col-6 col-md">
          <div className={`gerente-kpi${item.fuerte ? " is-fuerte" : ""}`}>
            <small>{item.label}</small>
            <strong>{item.valor}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KpisCierre;
