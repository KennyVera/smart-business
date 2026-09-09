import { dineroGerente } from "../formato";

function fila(etiqueta, valor, clase = "") {
  return (
    <div className={`gerente-desglose-fila ${clase}`.trim()}>
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function textoDescuadre(valor) {
  const n = Number(valor) || 0;
  if (n < 0) return { texto: `Faltante ${dineroGerente(n)}`, clase: "is-faltante" };
  if (n > 0) return { texto: `Sobrante +${dineroGerente(n)}`, clase: "is-sobrante" };
  return { texto: "Cuadrado", clase: "is-ok" };
}

function DesgloseEfectivo({ datos }) {
  const des = textoDescuadre(datos?.descuadre);
  return (
    <section className="gerente-off-seccion">
      <h3>Desglose de efectivo</h3>
      <div className="gerente-desglose">
        {fila("Fondo de apertura (+)", dineroGerente(datos?.monto_apertura))}
        {fila("Ventas en efectivo (+)", dineroGerente(datos?.ventas_efectivo))}
        {fila("Efectivo esperado (=)", dineroGerente(datos?.monto_esperado), "is-fuerte")}
        {fila("Efectivo contado (real)", dineroGerente(datos?.monto_cierre_real))}
        {fila("Descuadre", des.texto, des.clase)}
      </div>
    </section>
  );
}

export default DesgloseEfectivo;
