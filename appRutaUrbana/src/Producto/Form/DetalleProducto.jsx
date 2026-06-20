import * as React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductoService from "../../services/ProductoService";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
} from "@mui/material";

export default function DetalleProducto() {
  // Captura el parámetro "id" de la URL
  const { id } = useParams();

  // Estados locales:
  // producto: para almacenar los detalles del producto obtenido de la API
  // loading: para indicar si la información aún se está cargando
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  // Se ejecuta al montar el componente o cuando el "id" cambia. Llama a la
  // función getProducto del servicio para obtener los detalles del producto.
  useEffect(() => {
    // Llama al servicio para obtener los detalles del producto usando el ID de la URL
    ProductoService.getProducto(id)
      // Maneja la respuesta de la API, actualizando el estado del producto y el estado de carga
      .then((response) => {
        // Asumiendo que la respuesta es un array, se toma el primer elemento como el producto
        setProducto(response.data[0]);
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener detalle:", error);
        setLoading(false);
      });
  }, [id]);

  // Si está cargando, muestra un indicador de carga.
  // Si no se encuentra el producto, muestra un mensaje de error.
  if (loading) return <CircularProgress />;
  if (!producto) return <Typography>Producto no encontrado.</Typography>;
  console.log(producto);
  console.log(producto.ingredientes);
  return (
    <Card sx={{ maxWidth: 600, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CardMedia
          component="img"
          image={`http://localhost:81/apirutaurbana/${producto.Imagen}`}
          alt={producto.Nombre}
          sx={{
            width: 300,
            height: 300,
            objectFit: "cover",
          }}
        />
      </Box>

      <Typography variant="body1">Categoría: {producto.IdCategoria}</Typography>

      <Typography variant="h3">{producto.Nombre}</Typography>

      <Typography variant="body1">{producto.Descripcion}</Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Ingredientes
      </Typography>

      {producto.Ingredientes?.map((ingrediente) => (
        <Typography key={ingrediente.IdIngrediente} variant="body2">
          {ingrediente.Nombre}
        </Typography>
      ))}

      <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
        Precio: ₡{producto.Precio}
      </Typography>
    </Card>
  );
}
