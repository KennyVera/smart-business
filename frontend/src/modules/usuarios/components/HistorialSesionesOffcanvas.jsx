import { useCallback, useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import Paginacion from "../../../shared/Paginacion";
import { datosPaginacion, leerPagina, usePagina } from "../../../shared/paginado";
import { fetchSesiones, revocarSesion } from "../api/usuariosApi";
import { mensajeApi } from "../rol";
import SesionFiltro from "./SesionFiltro";
import SesionTarjeta from "./SesionTarjeta";

function HistorialSesionesOffcanvas({ show, usuario, onClose }) {
  const [sesiones, setSesiones] = useState({ count: 0, results: [] });
  const [soloActivas, setSoloActivas] = useState(false);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [revocando, setRevocando] = useState(false);
  const [pagina, setPagina] = usePagina(`${usuario?.id_usuario}|${soloActivas}`);

  const cargar = useCallback(async () => {
    if (!usuario) return;
    const { data } = await fetchSesiones(usuario.id_usuario, {
      page: pagina,
      activas: soloActivas ? 1 : undefined,
    });
    setSesiones(data);
  }, [usuario, pagina, soloActivas]);

  useEffect(() => {
    if (!show || !usuario) return;
    setAviso("");
    setError("");
    cargar().catch(() => setError("No se pudo cargar el historial de sesiones."));
  }, [show, usuario, cargar]);

  async function onRevocar(sesion) {
    setRevocando(true);
    try {
      await revocarSesion(sesion.id_sesion);
      setAviso("Sesión cerrada remotamente.");
      await cargar();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo cerrar la sesión."));
    } finally {
      setRevocando(false);
    }
  }

  const { items, total } = leerPagina(sesiones);
  const nombre = usuario?.nombre_completo || usuario?.username || "";

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" className="sesiones-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Sesiones de {nombre}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <SesionFiltro soloActivas={soloActivas} onCambio={setSoloActivas} />
        {aviso ? <p className="sesion-aviso">{aviso}</p> : null}
        {error ? <p className="text-danger">{error}</p> : null}
        {total === 0 ? (
          <p className="text-muted mb-0">No hay sesiones para mostrar.</p>
        ) : (
          <>
            {items.map((sesion) => (
              <SesionTarjeta
                key={sesion.id_sesion}
                sesion={sesion}
                onRevocar={onRevocar}
                revocando={revocando}
              />
            ))}
            <Paginacion
              {...datosPaginacion(pagina, total)}
              etiqueta="sesiones"
              compacta
              onCambio={setPagina}
            />
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default HistorialSesionesOffcanvas;
