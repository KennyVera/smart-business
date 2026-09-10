import { useCallback, useMemo, useState } from "react";
import { numero, redondear } from "../dinero";
import { TASA_IVA } from "../impuestos";

export const CANTIDAD_MAXIMA = 9999;

function tope(item) {
  const disponible = numero(item.disponible);
  // Stock 0 o negativo: se permite vender (descuadre); el tope es operativo, no físico.
  if (disponible <= 0) return CANTIDAD_MAXIMA;
  return Math.min(disponible, CANTIDAD_MAXIMA);
}

function linea(fila, cantidad) {
  const disponible = numero(fila.cantidad_actual);
  return {
    id_producto: fila.id_producto,
    sku: fila.sku,
    nombre: fila.nombre,
    categoria_nombre: fila.categoria_nombre,
    precio: numero(fila.precio_venta),
    disponible,
    stock_alerta: disponible <= 0,
    aplica_iva: fila.aplica_iva !== false,
    cantidad,
  };
}

function importe(item) {
  return item.precio * item.cantidad;
}

/**
 * Carrito temporal del cajero: vive solo en memoria hasta que se cobra.
 * El total incluye IVA 15% solo sobre las líneas gravadas.
 * Stock local 0 no bloquea la venta: se marca alerta de descuadre.
 */
export function useCart() {
  const [items, setItems] = useState([]);
  const [aviso, setAviso] = useState("");

  const agregar = useCallback((fila, suma = 1) => {
    setAviso("");
    setItems((actuales) => {
      const previo = actuales.find((item) => item.id_producto === fila.id_producto);
      const nuevo = previo ? { ...previo } : linea(fila, 0);
      nuevo.disponible = numero(fila.cantidad_actual);
      nuevo.stock_alerta = nuevo.disponible <= 0;
      nuevo.aplica_iva = fila.aplica_iva !== false;
      const pedida = nuevo.cantidad + suma;
      const maximo = tope(nuevo);
      if (pedida > maximo) {
        setAviso(`${fila.nombre}: máximo ${maximo} unidades por línea.`);
      }
      nuevo.cantidad = Math.min(pedida, maximo);
      if (nuevo.stock_alerta) {
        setAviso(`Stock local: 0 — ${fila.nombre} se cobrará con descuadre de inventario.`);
      }
      if (!previo) return [...actuales, nuevo];
      return actuales.map((item) =>
        item.id_producto === nuevo.id_producto ? nuevo : item,
      );
    });
  }, []);

  const fijarCantidad = useCallback((idProducto, cantidad) => {
    setAviso("");
    setItems((actuales) =>
      actuales.map((item) => {
        if (item.id_producto !== idProducto) return item;
        const maximo = tope(item);
        const limpia = Math.max(Math.round(numero(cantidad)), 1);
        if (limpia > maximo) {
          setAviso(`${item.nombre}: máximo ${maximo} unidades por línea.`);
        }
        const actualizado = {
          ...item,
          cantidad: Math.min(limpia, maximo),
          stock_alerta: item.disponible <= 0,
        };
        if (actualizado.stock_alerta) {
          setAviso(
            `Stock local: 0 — ${item.nombre} se cobrará con descuadre de inventario.`,
          );
        }
        return actualizado;
      }),
    );
  }, []);

  const quitar = useCallback((idProducto) => {
    setAviso("");
    setItems((actuales) =>
      actuales.filter((item) => item.id_producto !== idProducto),
    );
  }, []);

  const limpiar = useCallback(() => {
    setAviso("");
    setItems([]);
  }, []);

  const subtotalIva15 = useMemo(
    () =>
      redondear(
        items.reduce(
          (suma, item) => (item.aplica_iva ? suma + importe(item) : suma),
          0,
        ),
      ),
    [items],
  );

  const subtotalIva0 = useMemo(
    () =>
      redondear(
        items.reduce(
          (suma, item) => (item.aplica_iva ? suma : suma + importe(item)),
          0,
        ),
      ),
    [items],
  );

  const montoIva = useMemo(
    () => redondear(subtotalIva15 * TASA_IVA),
    [subtotalIva15],
  );

  const total = useMemo(
    () => redondear(subtotalIva15 + subtotalIva0 + montoIva),
    [subtotalIva15, subtotalIva0, montoIva],
  );

  const unidades = useMemo(
    () => items.reduce((suma, item) => suma + item.cantidad, 0),
    [items],
  );

  return {
    items,
    aviso,
    subtotalIva15,
    subtotalIva0,
    montoIva,
    total,
    unidades,
    agregar,
    fijarCantidad,
    quitar,
    limpiar,
    setAviso,
  };
}
