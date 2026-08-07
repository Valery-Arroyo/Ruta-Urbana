import { useEffect, useState } from "react";
import { TableRow, TableCell, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { formatCurrency } from "../../utils/format";

/*
 * Fila editable de una línea del pedido. Se separó del formulario
 * principal porque maneja su propio estado local para la cantidad:
 * el usuario debe poder borrar los dígitos de la caja de texto (dejarla
 * vacía momentáneamente) sin que eso elimine la línea. La línea solo
 * se elimina cuando el valor confirmado es 0, o con el botón de borrar.
 */
export default function LineaPedidoRow({
  linea,
  idioma,
  onCambiarCantidad,
  onCambiarObservaciones,
  onEliminar,
}) {
  const [cantidadTexto, setCantidadTexto] = useState(String(linea.cantidad));

  useEffect(() => {
    setCantidadTexto(String(linea.cantidad));
  }, [linea.cantidad]);

  const manejarCambioCantidad = (event) => {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, "");
    setCantidadTexto(soloNumeros);

    if (soloNumeros === "") {
      // La caja se ve vacía, pero todavía no se confirma ningún cambio
      return;
    }

    onCambiarCantidad(linea.key, parseInt(soloNumeros, 10));
  };

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
          inputProps={{
            inputMode: "numeric",
            style: { textAlign: "right", width: 50 },
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
