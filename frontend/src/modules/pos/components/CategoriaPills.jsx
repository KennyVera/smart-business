const TODAS = "";

function CategoriaPills({ categorias, activa, onCambio }) {
  const opciones = [{ id_categoria: TODAS, nombre: "Todos" }, ...categorias];

  return (
    <div className="pos-pills" role="tablist" aria-label="Filtrar por categoría">
      {opciones.map((categoria) => {
        const valor = String(categoria.id_categoria);
        const seleccionada = valor === String(activa);
        return (
          <button
            key={valor || "todas"}
            type="button"
            role="tab"
            aria-selected={seleccionada}
            className={`pos-pill${seleccionada ? " is-activa" : ""}`}
            onClick={() => onCambio(valor)}
          >
            {categoria.nombre}
          </button>
        );
      })}
    </div>
  );
}

export default CategoriaPills;
