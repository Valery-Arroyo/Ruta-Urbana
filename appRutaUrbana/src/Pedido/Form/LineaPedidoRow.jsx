import { useEffect, useState } from "react";
import { TableRow, TableCell, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { formatCurrency } from "../../utils/format";

// Componente para mostrar una fila de línea de pedido 
export default function LineaPedidoRow({
  linea,
  idioma,
  onCambiarCantidad,
  onCambiarObservaciones,
  onEliminar,
}) {

  // Estado local para manejar la cantidad como texto
  const [cantidadTexto, setCantidadTexto] = useState(String(linea.cantidad));

  // useEffect para actualizar el estado local cuando la cantidad de la línea cambie
  useEffect(() => {
    setCantidadTexto(String(linea.cantidad));
  }, [linea.cantidad]);

  // Función para manejar el cambio en el campo de cantidad
  const manejarCambioCantidad = (event) => {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, "");
    setCantidadTexto(soloNumeros);

    // Si el campo está vacío, no se realiza ninguna acción
    if (soloNumeros === "") {
      
      return;
    }

    // Llamar a la función onCambiarCantidad con la nueva cantidad
    onCambiarCantidad(linea.key, parseInt(soloNumeros, 10));
  };

  // Función para manejar el evento onBlur del campo de cantidad
  const manejarBlurCantidad = () => {
    if (cantidadTexto === "") {
      setCantidadTexto(String(linea.cantidad));
    }
  };

  return (
    <TableRow>
      <TableCell>{linea.nombre}</TableCell>
      <TableCell align="right">
        {formatCurrency(linea.precioUnitario, idioma)}
      </TableCell>
      <TableCell align="right">
        <TextField
          value={cantidadTexto}
          onChange={manejarCambioCantidad}
          onBlur={manejarBlurCantidad}
          size="small"
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              style: { textAlign: "right", width: 50 },
            },
          }}
        />
      </TableCell>
      <TableCell align="right">
        {formatCurrency(linea.subtotal, idioma)}
      </TableCell>
      <TableCell align="right">
        {formatCurrency(linea.impuesto, idioma)}
      </TableCell>
      <TableCell>
        <TextField
          value={linea.observaciones}
          onChange={(event) =>
            onCambiarObservaciones(linea.key, event.target.value)
          }
          size="small"
          fullWidth
          placeholder="Ej. sin cebolla"
        />
      </TableCell>
      <TableCell align="center">
        <IconButton color="error" onClick={() => onEliminar(linea.key)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
