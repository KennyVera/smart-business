import { useCallback, useState } from "react";
import { useFilasPorPagina } from "../../../context/PreferencesContext";
import Paginacion from "../../../shared/Paginacion";
import { useDatosPaginacion, usePagina } from "../../../shared/paginado";
import { useDebounce } from "../../../shared/useRecurso";
import { fetchZonas } from "../api/geografiaApi";
import { useLista } from "../hooks/useLista";

function ZonasPage() {
  const [texto, setTexto] = useState("");
  const buscar = useDebounce(texto, 300);
  const [pagina, setPagina] = usePagina(buscar);
  const pageSize = useFilasPorPagina();
  const cargar = useCallback(
    () =>
      fetchZonas({
        page: pagina,
        page_size: pageSize,
        buscar: buscar || undefined,
      }),
    [pagina, pageSize, buscar],
  );
  const { items: zonas, total, error, cargando } = useLista(
    cargar,
    "No se pudieron cargar las zonas de planificación.",
  );
  const paginacionUi = useDatosPaginacion(pagina, total);

  return (
    <div className="page-card">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="mb-0">Zonas de planificación</h2>
        <input
          type="search"
          className="form-control geo-zonas-buscar"
          style={{ maxWidth: 320 }}
          placeholder="Buscar zona, provincia o cantón…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Buscar zona por nombre, provincia o cantón"
        />
      </div>
      {cargando ? <p className="text-muted mb-0">Cargando zonas...</p> : null}
      {error ? <p className="text-danger mb-0">{error}</p> : null}
      {!cargando && !error ? (
        <>
          {zonas.length === 0 ? (
            <p className="text-muted mb-0">
              No hay zonas que coincidan con “{buscar}”.
            </p>
          ) : (
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
          )}
          <Paginacion
            {...paginacionUi}
            etiqueta="zonas"
            onCambio={setPagina}
          />
        </>
      ) : null}
    </div>
  );
}

export default ZonasPage;
