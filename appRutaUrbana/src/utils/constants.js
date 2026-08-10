// Nombres de rol tal como están guardados en la tabla Rol de la base de datos.
// Se usan para decidir qué puede ver/hacer cada usuario (nunca se decide
// mirando la interfaz, sino esta variable con el rol que viene del token).
export const ROLES = {
  ADMINISTRADOR: "Administrador",
  ENCARGADO: "Encargado",
  COCINA: "Cocina",
  CLIENTE: "Cliente",
};

// Porcentaje de impuesto aplicado a cada línea del pedido
export const TAX_RATE = 0.13;

// Costo fijo de envío cuando el método de entrega es "a domicilio"
export const SHIPPING_COST = 1500;
