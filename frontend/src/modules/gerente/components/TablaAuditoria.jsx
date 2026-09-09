import { Eye } from "lucide-react";
import { dineroGerente, horaCorta } from "../formato";

function celdaDescuadre(valor) {
  const n = Number(valor) || 0;
  if (n < 0) {
    return <span className="gerente-faltante fw-bold">Faltante {dineroGerente(n)}</span>;
  }
  if (n > 0) {
    return (
      <span className="gerente-sobrante fw-bold">Sobrante +{dineroGerente(n)}</span>
    );
  }
  return <span className="text-success fw-bold">Cuadrado</span>;
}

function TablaAuditoria({ turnos, onVerDetalle }) {
  return (
    <div className="table-responsive page-card">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>Turno</th>
            <th>Caja</th>
            <th>Cajero</th>
            <th>Cierre</th>
            <th className="text-end">Esperado</th>
            <th className="text-end">Real</th>
            <th>Descuadre</th>
            <th>Estado</th>
            <th className="text-end">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {turnos.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-muted">
                No hay turnos cerrados en el rango seleccionado.
              </td>
            </tr>
          ) : (
            turnos.map((t) => (
              <tr
                key={t.id_turno}
                className="gerente-fila-turno"
                onClick={() => onVerDetalle(t)}
              >
                <td>#{t.id_turno}</td>
                <td>{t.terminal_serie}</td>
                <td>{t.cajero}</td>
                <td>{horaCorta(t.fecha_cierre)}</td>
                <td className="text-end">{dineroGerente(t.monto_esperado)}</td>
                <td className="text-end">{dineroGerente(t.monto_cierre_real)}</td>
                <td>{celdaDescuadre(t.descuadre)}</td>
                <td>
                  {t.auditado ? (
                    <span className="badge text-bg-success">Auditado</span>
                  ) : (
                    <span className="badge text-bg-warning text-dark">Pendiente</span>
                  )}
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    title="Ver desglose"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerDetalle(t);
                    }}
                  >
                    <Eye size={16} strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaAuditoria;
