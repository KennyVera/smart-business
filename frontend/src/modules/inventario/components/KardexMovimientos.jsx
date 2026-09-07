const TONO = {
  ENTRADA_LOTE: "entrada",
  VENTA_POS: "salida",
  MERMA: "salida",
  AJUSTE: "ajuste",
};

function fechaHora(valor) {
  const fecha = new Date(valor);
  return fecha.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KardexMovimientos({ movimientos }) {
  if (movimientos.length === 0) {
    return (
      <p className="inv-desglose-vacio">
        Este producto todavía no tiene movimientos registrados.
      </p>
    );
  }

  return (
    <div className="table-responsive inv-wrap">
      <table className="table inv-table inv-table-densa align-middle mb-0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Movimiento</th>
            <th className="text-end">Cant.</th>
            <th className="text-end">Saldo</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((movimiento) => (
            <tr key={movimiento.id_movimiento}>
              <td className="inv-kardex-fecha">{fechaHora(movimiento.fecha)}</td>
              <td>
                <span className={`inv-mov is-${TONO[movimiento.tipo] || "ajuste"}`}>
                  {movimiento.tipo_nombre}
                </span>
                {movimiento.referencia ? (
                  <small className="inv-kardex-ref">{movimiento.referencia}</small>
                ) : null}
              </td>
              <td
                className={`inv-num inv-num-fuerte inv-delta is-${
                  movimiento.cantidad < 0 ? "salida" : "entrada"
                }`}
              >
                {movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad}
              </td>
              <td className="inv-num text-muted">{movimiento.stock_resultante}</td>
              <td className="inv-kardex-usuario">{movimiento.usuario_nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default KardexMovimientos;
