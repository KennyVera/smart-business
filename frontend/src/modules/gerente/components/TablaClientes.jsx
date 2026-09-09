import { Cake, ChevronRight, Crown } from "lucide-react";
import { dineroGerente, fechaHoraCorta } from "../formato";

function iniciales(nombre = "") {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function TablaClientes({ clientes = [], onVerDetalle, resaltarRiesgo = false }) {
  return (
    <div className="page-card gerente-clientes-card">
      <div className="table-responsive">
        <table className="table table-hover table-borderless align-middle mb-0 gerente-clientes-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Cédula / RUC</th>
              <th>Cumpleaños</th>
              <th className="text-end">Visitas</th>
              <th className="text-end">Total gastado</th>
              <th>Última compra</th>
              <th aria-label="Abrir" />
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted text-center py-4">
                  No hay clientes con ventas en tu sucursal.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr
                  key={cliente.id_cliente}
                  className={`gerente-fila-cliente${cliente.es_vip ? " is-vip" : ""}`}
                  onClick={() => onVerDetalle?.(cliente)}
                >
                  <td>
                    <div className="gerente-cliente-cell">
                      <span className={`gerente-cliente-miniavatar${cliente.es_vip ? " is-vip" : ""}`}>
                        {iniciales(cliente.nombre_completo)}
                      </span>
                      <div>
                        <strong>{cliente.nombre_completo}</strong>
                        {cliente.es_vip ? (
                          <span className="badge gerente-vip-badge ms-2">
                            <Crown size={11} /> VIP
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="gerente-cedula">{cliente.cedula_ruc || "—"}</code>
                  </td>
                  <td>
                    {cliente.fecha_nacimiento ? (
                      <span className={`gerente-cumple${cliente.cumple_mes ? " is-hoy" : ""}`}>
                        {cliente.fecha_nacimiento}
                        {cliente.cumple_mes ? (
                          <Cake size={15} className="gerente-cake" aria-label="Cumpleaños este mes" />
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-muted">Sin registrar</span>
                    )}
                  </td>
                  <td className="text-end">
                    <span className="gerente-metric-pill">{cliente.frecuencia_visitas || 0}</span>
                  </td>
                  <td className={`text-end${cliente.es_vip ? " gerente-gasto-vip" : ""}`}>
                    {dineroGerente(cliente.total_gastado)}
                  </td>
                  <td
                    className={
                      resaltarRiesgo ? "text-danger fw-semibold" : "text-muted"
                    }
                  >
                    {fechaHoraCorta(cliente.ultima_compra)}
                  </td>
                  <td className="text-end text-muted">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaClientes;
