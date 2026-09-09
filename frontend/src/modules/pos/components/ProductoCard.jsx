import { useEffect, useState } from "react";
import { Package, Plus } from "lucide-react";
import { dinero } from "../dinero";

function urlImagen(valor) {
  const ruta = (valor || "").trim();
  if (!ruta) return "";
  if (/^https?:\/\//i.test(ruta) || ruta.startsWith("/")) return ruta;
  return `/${ruta}`;
}

function ProductoCard({ fila, onAgregar }) {
  const agotado = fila.cantidad_actual <= 0;
  const url = urlImagen(fila.imagen);
  const [sinFoto, setSinFoto] = useState(!url);

  useEffect(() => {
    setSinFoto(!url);
  }, [url]);

  const mostrarFoto = Boolean(url) && !sinFoto;

  return (
    <button
      type="button"
      className={`pos-card${agotado ? " is-agotada" : ""}`}
      disabled={agotado}
      title={agotado ? "Sin stock en esta sucursal" : `Agregar ${fila.nombre}`}
      onClick={() => onAgregar(fila)}
    >
      <span className="pos-card-imagen">
        {mostrarFoto ? (
          <img
            src={url}
            alt={fila.nombre}
            className="img-pos-foto"
            onError={() => setSinFoto(true)}
          />
        ) : (
          <>
            <Package size={30} strokeWidth={1.25} />
            <em>{fila.sku}</em>
          </>
        )}
      </span>
      <span className="pos-card-nombre">{fila.nombre}</span>
      <span className="pos-card-categoria">{fila.categoria_nombre}</span>
      <span className="pos-card-pie">
        <strong>{dinero(fila.precio_venta)}</strong>
        <span className="pos-card-mas">
          <Plus size={16} strokeWidth={2.5} />
        </span>
      </span>
      <span className="pos-card-stock">
        {agotado ? "Sin stock" : `${fila.cantidad_actual} disp.`}
      </span>
    </button>
  );
}

export default ProductoCard;
