import { clasificarMargen, formatearMargen } from "../margen";

function MargenBadge({ valor }) {
  const { tono, texto } = clasificarMargen(valor);
  return (
    <span className={`inv-margen is-${tono}`}>
      <strong>{formatearMargen(valor)}</strong>
      <span>{texto}</span>
    </span>
  );
}

export default MargenBadge;
