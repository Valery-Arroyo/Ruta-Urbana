import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { TAX_RATE } from "../utils/constants";


const PedidoEnCursoContext = createContext(null);

function redondear(numero) {
  return Math.round((numero + Number.EPSILON) * 100) / 100;
}

function calcularLinea(precioUnitario, cantidad) {
  const subtotal = redondear(precioUnitario * cantidad);
  const impuesto = redondear(subtotal * TAX_RATE);
  return { subtotal, impuesto };
}

export function PedidoEnCursoProvider({ children }) {
  const [lineas, setLineas] = useState([]);

  const agregarLinea = useCallback(({ tipo, idItem, nombre, precioUnitario, cantidad }) => {
    setLineas((actuales) => {
      const existente = actuales.find(
        (linea) => linea.tipo === tipo && linea.idItem === idItem,
      );

      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;
        const { subtotal, impuesto } = calcularLinea(precioUnitario, nuevaCantidad);

        return actuales.map((linea) =>
          linea.key === existente.key
            ? { ...linea, cantidad: nuevaCantidad, subtotal, impuesto }
            : linea,
        );
      }

      const { subtotal, impuesto } = calcularLinea(precioUnitario, cantidad);

      return [
        ...actuales,
        {
          key: `${tipo}-${idItem}-${Date.now()}`,
          tipo,
          idItem,
          nombre,
          precioUnitario,
          cantidad,
          observaciones: "",
          subtotal,
          impuesto,
        },
      ];
    });
  }, []);

  const actualizarCantidad = useCallback((key, cantidad) => {
    if (cantidad <= 0) {
      setLineas((actuales) => actuales.filter((linea) => linea.key !== key));
      return;
    }

    setLineas((actuales) =>
      actuales.map((linea) => {
        if (linea.key !== key) return linea;

        const { subtotal, impuesto } = calcularLinea(linea.precioUnitario, cantidad);
        return { ...linea, cantidad, subtotal, impuesto };
      }),
    );
  }, []);

  const actualizarObservaciones = useCallback((key, observaciones) => {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.key === key ? { ...linea, observaciones } : linea,
      ),
    );
  }, []);

  const eliminarLinea = useCallback((key) => {
    setLineas((actuales) => actuales.filter((linea) => linea.key !== key));
  }, []);

  const limpiarPedido = useCallback(() => {
    setLineas([]);
  }, []);

  const { subtotal, impuesto, cantidadTotal } = useMemo(() => {
    return lineas.reduce(
      (acumulado, linea) => ({
        subtotal: redondear(acumulado.subtotal + linea.subtotal),
        impuesto: redondear(acumulado.impuesto + linea.impuesto),
        cantidadTotal: acumulado.cantidadTotal + linea.cantidad,
      }),
      { subtotal: 0, impuesto: 0, cantidadTotal: 0 },
    );
  }, [lineas]);

  const value = {
    lineas,
    subtotal,
    impuesto,
    cantidadTotal,
    agregarLinea,
    actualizarCantidad,
    actualizarObservaciones,
    eliminarLinea,
    limpiarPedido,
  };

  return (
    <PedidoEnCursoContext.Provider value={value}>
      {children}
    </PedidoEnCursoContext.Provider>
  );
}

export function usePedidoEnCurso() {
  return useContext(PedidoEnCursoContext);
}
