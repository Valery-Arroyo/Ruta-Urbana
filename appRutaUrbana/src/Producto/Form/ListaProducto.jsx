import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Box,
} from "@mui/material";

import ZoomInIcon from "@mui/icons-material/ZoomIn";

export default function ListProductosPublic() {

  // Sirve para navegar a la página de detalle del producto
  const navigate = useNavigate();

  // Estado local para almacenar la lista de productos obtenida de la API
  const [data, setData] = useState([]);

  // Se ejecuta al montar el componente, 
  // llamando a la función getProductos del servicio para obtener la lista de productos
  React.useEffect(() => {
    // Llama al servicio para obtener la lista de productos 
    // y maneja la respuesta para actualizar el estado local
    ProductoService.getProductos()
      .then((response) => {
        // Dependiendo de la estructura de la respuesta, 
        // se actualiza el estado "data" con la lista de productos
        if (Array.isArray(response.data)) {
          setData(response.data);
          // Si la respuesta es un array, se asigna directamente al estado
        } else if (response.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
          // Si la respuesta tiene una propiedad "data" que es un array, se asigna esa propiedad al estado
        } else if (response.data) {
          setData([response.data]);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error("Error cargando productos:", error));
  }, []);

  // Función para manejar el clic en el botón de detalle, 
  // navegando a la página de detalle del producto usando su ID
  const detalle = (id) => {
    navigate(`/productos/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        Nuestros Productos
      </Typography>

      <Grid container spacing={4}>
        {data.map((row) => (
          <Grid key={row.IdProducto} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={`http://localhost:81/apirutaurbana/${row.Imagen}`}
                alt={row.Nombre}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  align="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  {row.Nombre}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    minHeight: 60,
                    textAlign: "center",
                  }}
                >
                  {row.Descripcion}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: "center",
                  pb: 2,
                }}
              >
                <Tooltip title="Ver detalle">
                  <IconButton
                    color="success"
                    onClick={() => detalle(row.IdProducto)}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
