import { ChevronLeft, ChevronRight } from "lucide-react";
import "./paginacion.css";

const VECINAS = 1;
const CORTE = "corte";

const SINGULAR = {
  categorías: "categoría",
  errores: "error",
  filas: "fila",
  lotes: "lote",
  movimientos: "movimiento",
  productos: "producto",
  registros: "registro",
  sesiones: "sesión",
  sucursales: "sucursal",
  terminales: "terminal",
  usuarios: "usuario",
  zonas: "zona",
  clientes: "cliente",
};

function numeros(pagina, paginas) {
  const claves = new Set([1, paginas]);
  for (let valor = pagina - VECINAS; valor <= pagina + VECINAS; valor += 1) {
    if (valor >= 1 && valor <= paginas) claves.add(valor);
  }
  const ordenadas = [...claves].sort((uno, otro) => uno - otro);
  return ordenadas.flatMap((valor, indice) => {
    const previa = ordenadas[indice - 1];
    return previa && valor - previa > 1 ? [CORTE, valor] : [valor];
  });
}

function Paginacion({
  pagina,
  paginas,
  total,
  desde,
  hasta,
  etiqueta = "registros",
  compacta,
  onCambio,
}) {
  if (total === 0) return null;
  if (paginas === 1 && compacta) return null;

  return (
    <div className={`paginacion${compacta ? " is-compacta" : ""}`}>
      <span className="paginacion-conteo">
        Mostrando <strong>{desde}</strong>–<strong>{hasta}</strong> de{" "}
        <strong>{total.toLocaleString("es-EC")}</strong>{" "}
        {total === 1 ? SINGULAR[etiqueta] || etiqueta : etiqueta}
      </span>
      {paginas > 1 ? (
        <div className="paginacion-controles">
          <button
            type="button"
            className="paginacion-flecha"
            title="Página anterior"
            disabled={pagina === 1}
            onClick={() => onCambio(pagina - 1)}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          {numeros(pagina, paginas).map((valor, indice) =>
            valor === CORTE ? (
              <span key={`corte-${indice}`} className="paginacion-corte">
                …
              </span>
            ) : (
              <button
                key={valor}
                type="button"
                className={`paginacion-num${valor === pagina ? " is-activa" : ""}`}
                aria-current={valor === pagina ? "page" : undefined}
                onClick={() => onCambio(valor)}
              >
                {valor}
              </button>
            ),
          )}
          <button
            type="button"
            className="paginacion-flecha"
            title="Página siguiente"
            disabled={pagina === paginas}
            onClick={() => onCambio(pagina + 1)}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default Paginacion;
