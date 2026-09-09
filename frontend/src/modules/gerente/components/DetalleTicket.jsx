function dinero(valor) {
  const n = Number(valor) || 0;
  return `$ ${n.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function DetalleTicket({ venta, onAnular, anulando }) {
  if (!venta) return null;
  return (
    <div className="page-card mt-3">
      <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="mb-1">Ticket #{venta.id_venta}</h2>
          <small className="text-muted">
            {venta.sucursal_nombre} · {venta.cajero} · {venta.fecha_hora}
          </small>
        </div>
        {venta.anulada ? (
          <span className="badge text-bg-secondary align-self-start">Anulada</span>
        ) : (
          <button
            type="button"
            className="btn btn-danger"
            disabled={anulando}
            onClick={onAnular}
          >
            {anulando ? "Anulando…" : "Autorizar Devolución y Anular Factura"}
          </button>
        )}
      </div>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th className="text-end">Cant.</th>
            <th className="text-end">P. unit.</th>
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {(venta.detalles || []).map((d) => (
            <tr key={`${d.producto}-${d.sku}`}>
              <td>{d.sku}</td>
              <td>{d.producto_nombre}</td>
              <td className="text-end">{d.cantidad}</td>
              <td className="text-end">{dinero(d.precio_unitario_historico)}</td>
              <td className="text-end">{dinero(d.total_linea)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-end fw-bold">Total {dinero(venta.total_factura)}</div>
    </div>
  );
}

export default DetalleTicket;
