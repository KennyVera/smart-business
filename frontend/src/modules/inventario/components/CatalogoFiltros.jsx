import { Download, Layers, Plus, TrendingUp, Upload } from "lucide-react";
import { OPCIONES_MARGEN } from "../margen";

function CatalogoFiltros({
  categorias,
  categoria,
  margen,
  onCategoria,
  onMargen,
  onExportar,
  onImportar,
  onNuevo,
}) {
  return (
    <>
      <div className="inv-filtro-select">
        <Layers size={15} strokeWidth={1.75} />
        <select
          className="form-select"
          value={categoria}
          onChange={(event) => onCategoria(event.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((item) => (
            <option key={item.id_categoria} value={item.id_categoria}>
              {item.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="inv-filtro-select">
        <TrendingUp size={15} strokeWidth={1.75} />
        <select
          className="form-select"
          value={margen}
          onChange={(event) => onMargen(event.target.value)}
        >
          {OPCIONES_MARGEN.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </div>
      <button type="button" className="btn-inv-outline" onClick={onExportar}>
        <Download size={16} strokeWidth={1.9} />
        Exportar
      </button>
      <button type="button" className="btn-inv-outline" onClick={onImportar}>
        <Upload size={16} strokeWidth={1.9} />
        Importar CSV
      </button>
      <button type="button" className="btn-inv" onClick={onNuevo}>
        <Plus size={16} strokeWidth={2} />
        Nuevo producto
      </button>
    </>
  );
}

export default CatalogoFiltros;
