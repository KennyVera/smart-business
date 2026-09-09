function dinero(valor) {
  const n = Number(valor) || 0;
  return `$ ${n.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TablaCajeros({ filas = [] }) {
  return (
    <div className="page-card">
      <h2 className="mb-3">Ventas por cajero</h2>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>Cajero</th>
              <th className="text-end">Tickets</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-muted">
                  Sin ventas hoy.
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.cajero}>
                  <td>{fila.cajero}</td>
                  <td className="text-end">{fila.tickets}</td>
                  <td className="text-end">{dinero(fila.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaCajeros;
