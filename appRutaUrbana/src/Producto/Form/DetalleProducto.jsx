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
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductoService.getProducto(id)
      .then((response) => {
        setProducto(response.data[0]);
        console.log(response.data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener detalle:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!producto) return <Typography>Producto no encontrado.</Typography>;

  console.log(producto);
  console.log(producto.Ingredientes);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          minHeight: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CardMedia
            component="img"
            image={`http://localhost:81/apirutaurbana/${producto.Imagen}`}
            alt={producto.Nombre}
            sx={{
              width: 300,
              height: 300,
              minHeight: 300,
              maxHeight: 300,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        </Box>

        <Typography variant="body1" sx={{ mt: 2 }}>
          Categoría: {producto.NombreCategoria}
        </Typography>

        <Typography variant="h3" sx={{ mt: 1 }}>
          {producto.Nombre}
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          {producto.Descripcion}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Ingredientes
        </Typography>

        {producto.Ingredientes?.map((ingrediente) => (
          <Typography key={ingrediente.IdIngrediente} variant="body2">
            {ingrediente.Nombre}
          </Typography>
        ))}

        <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
          Precio: ₡{Number(producto.Precio).toLocaleString("es-CR")}
        </Typography>
      </Card>
    </Box>
  );
}
