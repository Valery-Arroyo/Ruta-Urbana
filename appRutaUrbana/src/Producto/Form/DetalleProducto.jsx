import * as React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductoService from "../../services/ProductoService";
import { Box, Typography, Card, CardMedia, CircularProgress } from "@mui/material";

export default function DetalleProducto() {
  const { id } = useParams(); 
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Asegúrate de tener un método en tu Service que haga: GET /productos/:id
    ProductoService.getProducto(id)
      .then((response) => {
        setProducto(response.data[0]);
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener detalle:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!producto) return <Typography>Producto no encontrado.</Typography>;

  return (
   <Card sx={{ maxWidth: 600, p: 2 }}>
  <CardMedia
    component="img"
    height="300"
    image={`http://localhost:81/apirutaurbana/${producto.Imagen}`}
    alt={producto.Nombre}
  />
  <Typography variant="body1">
    Categoría ID: {producto.IdCategoria}
  </Typography>
  <Typography variant="h3">{producto.Nombre}</Typography>
  <Typography variant="body1">{producto.Descripcion}</Typography>
  <Typography variant="h5" color="primary">
    Precio: ${producto.Precio}
  </Typography>
</Card>

  );
}