import { useCallback } from "react";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, usePagina } from "../../../shared/paginado";
import { fetchZonas } from "../api/geografiaApi";
import { useLista } from "../hooks/useLista";

function ZonasPage() {
  const [pagina, setPagina] = usePagina();
  const cargar = useCallback(() => fetchZonas({ page: pagina }), [pagina]);
  const { items: zonas, total, error, cargando } = useLista(
    cargar,
    "No se pudieron cargar las zonas de planificación.",
  );

  return (
    <div className="page-card">
      <h2>Zonas de planificación</h2>
      {cargando ? <p className="text-muted mb-0">Cargando zonas...</p> : null}
      {error ? <p className="text-danger mb-0">{error}</p> : null}
      {!cargando && !error ? (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-borderless align-middle mb-0">
              <thead>
                <tr className="text-muted">
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {zonas.map((zona) => (
                  <tr key={zona.id_nombre}>
                    <td>{zona.codigo}</td>
                    <td>{zona.nombre}</td>
                    <td>{zona.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion
            {...datosPaginacion(pagina, total)}
            etiqueta="zonas"
            onCambio={setPagina}
          />
        </>
      ) : null}
    </div>
  );
}

export default ZonasPage;
