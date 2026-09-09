import { useCallback, useMemo, useState } from "react";
import { numero, redondear } from "../dinero";
import { TASA_IVA } from "../impuestos";

export const CANTIDAD_MAXIMA = 9999;

function tope(item) {
  const disponible = numero(item.disponible);
  return Math.min(disponible > 0 ? disponible : CANTIDAD_MAXIMA, CANTIDAD_MAXIMA);
}

function linea(fila, cantidad) {
  return {
    id_producto: fila.id_producto,
    sku: fila.sku,
    nombre: fila.nombre,
    categoria_nombre: fila.categoria_nombre,
    precio: numero(fila.precio_venta),
    disponible: numero(fila.cantidad_actual),
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
      nuevo.aplica_iva = fila.aplica_iva !== false;
      const pedida = nuevo.cantidad + suma;
      const maximo = tope(nuevo);
      if (maximo <= 0) {
        setAviso(`${fila.nombre} no tiene stock disponible.`);
        return actuales;
      }
      if (pedida > maximo) {
        setAviso(`${fila.nombre}: solo quedan ${maximo} unidades.`);
      }
      nuevo.cantidad = Math.min(pedida, maximo);
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
          setAviso(`${item.nombre}: solo quedan ${maximo} unidades.`);
        }
        return { ...item, cantidad: Math.min(limpia, maximo) };
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
