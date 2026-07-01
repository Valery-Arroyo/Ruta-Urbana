import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Box,
  Button,
} from "@mui/material";

import ZoomInIcon from "@mui/icons-material/ZoomIn";

export default function ListProductosPublic() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    ProductoService.getProductos()
      .then((response) => {
        const resData = response.data;

        console.log("PRODUCTOS:", resData);

        if (Array.isArray(resData)) {
          setData(resData);
        } else if (resData?.data && Array.isArray(resData.data)) {
          setData(resData.data);
        } else if (resData) {
          setData([resData]);
        } else {
          setData([]);
        }
      })
      .catch((error) => {
        console.error("Error cargando productos:", error);
      });
  }, []);

  const detalle = (id) => {
    navigate(`/productos/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          mb: 1,
          fontWeight: "bold",
          color: "black",
          letterSpacing: 1,
        }}
      >
        Nuestros Productos
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{
          mb: 4,
          color: "text.secondary",
        }}
      >
        Conoce nuestros productos preparados con ingredientes de calidad.
      </Typography>

      <Grid container spacing={4}>
        {data.map((row) => (
          <Grid key={row.IdProducto} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                boxShadow: "0 10px 20px rgba(0,0,0,.12)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 16px 28px rgba(0,0,0,.18)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={`http://localhost:81/apirutaurbana/${row.Imagen}`}
                alt={row.Nombre}
                sx={{
                  objectFit: "cover",
                }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: "#333",
                    mb: 1,
                  }}
                >
                  {row.Nombre}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    minHeight: 70,
                    textAlign: "center",
                    lineHeight: 1.6,
                    fontSize: "0.98rem",
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
                <Button
                  variant="contained"
                  startIcon={<ZoomInIcon />}
                  onClick={() => detalle(row.IdProducto)}
                  sx={{
                    bgcolor: "#FF8C00",
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: "bold",
                    px: 3,
                    "&:hover": {
                      bgcolor: "#E67E00",
                    },
                  }}
                >
                  Ver detalle
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
