import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductoService from "../../services/ProductoService";

import {
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  Button,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={55} sx={{ color: "#FF8C00" }} />
      </Box>
    );

  if (!producto) return <Typography>Producto no encontrado.</Typography>;

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
          p: 3,
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          border: "2px solid #FF8C00",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            alignSelf: "flex-start",
            color: "black",
            borderColor: "black",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              borderColor: "black",
              backgroundColor: "#FFF3E0",
            },
          }}
        >
          Volver
        </Button>

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
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
        </Box>

        <Typography
          variant="body1"
          sx={{
            mt: 2,
            fontSize: "1.05rem",
            color: "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          Categoría: {producto.NombreCategoria}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            mt: 1,
            fontSize: "2.2rem",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {producto.Nombre}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mt: 1,
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          {producto.Descripcion}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mt: 3,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Ingredientes
        </Typography>

        {producto.Ingredientes?.map((ingrediente) => (
          <Typography
            key={ingrediente.IdIngrediente}
            variant="body2"
            sx={{
              fontSize: "1rem",
              py: 0.3,
            }}
          >
            • {ingrediente.Nombre}
          </Typography>
        ))}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            pt: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
            }}
          >
            Precio
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "black",
              fontSize: "1.7rem",
            }}
          >
            ₡{Number(producto.Precio).toLocaleString("es-CR")}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
