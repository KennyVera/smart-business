import { dinero } from "../dinero";

function montoFirmado(valor) {
  const signo = valor < 0 ? "-" : "+";
  return `${signo}${dinero(Math.abs(valor)).replace(/^\$\s*/, "$")}`;
}

function AvisoDescuadre({ vacio, diferencia }) {
  if (vacio) return null;
  if (diferencia < 0) {
    return (
      <p className="text-danger fw-bold pos-descuadre mb-0 mt-2">
        Faltante en caja: {montoFirmado(diferencia)}
      </p>
    );
  }
  if (diferencia > 0) {
    return (
      <p className="text-warning fw-bold pos-descuadre mb-0 mt-2">
        Sobrante en caja: {montoFirmado(diferencia)}
      </p>
    );
  }
  return (
    <p className="text-success fw-bold pos-descuadre mb-0 mt-2">✓ Caja cuadrada</p>
  );
}

export default AvisoDescuadre;
