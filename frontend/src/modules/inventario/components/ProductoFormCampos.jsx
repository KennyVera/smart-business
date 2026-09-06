import { Barcode, CircleDollarSign, Layers, Tag, TrendingUp } from "lucide-react";
import { LIMITES } from "../validacion";
import { MARGEN_ALEGRE, clasificarMargen, formatearMargen } from "../margen";
import InventarioCampo from "./InventarioCampo";

function margenPrevisto(form) {
  const costo = Number(form.costo_actual);
  const precio = Number(form.precio_venta);
  if (!Number.isFinite(costo) || !Number.isFinite(precio) || precio <= 0) return null;
  return ((precio - costo) / precio) * 100;
}

function ProductoFormCampos({ form, categorias, onCampo }) {
  const margen = margenPrevisto(form);
  const { tono, texto } = clasificarMargen(margen);

  return (
    <>
      <InventarioCampo
        icon={Barcode}
        label="Código de barras (SKU)"
        ayuda={`Letras, números y guiones. Máximo ${LIMITES.sku} caracteres.`}
      >
        <input
          className="form-control"
          value={form.sku}
          maxLength={LIMITES.sku}
          minLength={4}
          autoComplete="off"
          placeholder="LAC-0001"
          onChange={(event) => onCampo("sku", event.target.value)}
        />
      </InventarioCampo>
      <InventarioCampo icon={Tag} label="Nombre del producto">
        <input
          className="form-control"
          value={form.nombre}
          maxLength={LIMITES.nombre}
          minLength={3}
          placeholder="Requesón artesanal 500 g"
          onChange={(event) => onCampo("nombre", event.target.value)}
        />
      </InventarioCampo>
      <InventarioCampo icon={Layers} label="Categoría">
        <select
          className="form-select"
          value={form.categoria}
          onChange={(event) => onCampo("categoria", event.target.value)}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id_categoria} value={categoria.id_categoria}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </InventarioCampo>
      <div className="row g-2">
        <div className="col-6">
          <InventarioCampo icon={CircleDollarSign} label="Costo actual">
            <input
              className="form-control"
              value={form.costo_actual}
              inputMode="decimal"
              placeholder="0.00"
              onChange={(event) => onCampo("costo_actual", event.target.value)}
            />
          </InventarioCampo>
        </div>
        <div className="col-6">
          <InventarioCampo icon={CircleDollarSign} label="Precio de venta">
            <input
              className="form-control"
              value={form.precio_venta}
              inputMode="decimal"
              placeholder="0.00"
              onChange={(event) => onCampo("precio_venta", event.target.value)}
            />
          </InventarioCampo>
        </div>
      </div>
      <div className={`inv-margen-previo is-${tono}`}>
        <TrendingUp size={16} strokeWidth={1.75} />
        <span>
          Margen estimado <strong>{formatearMargen(margen)}</strong> · {texto}
        </span>
        <small>Se calcula al vuelo; no se guarda en la base (3FN).</small>
      </div>
      {margen !== null && margen < MARGEN_ALEGRE ? (
        <p className="inv-aviso-margen mb-0">
          Con menos de {MARGEN_ALEGRE}% el producto deja poco para la sucursal.
        </p>
      ) : null}
    </>
  );
}

export default ProductoFormCampos;
