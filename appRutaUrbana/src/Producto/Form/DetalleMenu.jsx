import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuService from "../../services/MenuService";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_URL = import.meta.env.VITE_BASE_URL;

export default function DetalleMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    MenuService.get(id)
      .then((response) => {
        console.log("PRODUCTOS:", response.data.Productos);
        console.log("COMBOS:", response.data.Combos);
        setDetalle(response.data);
      })
      .catch((error) => {
        console.error("Error cargando detalle:", error);
      });
  }, [id]);

  if (!detalle) {
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
  }

  const safeItems = [...(detalle.Productos || []), ...(detalle.Combos || [])];

  // Agrupar por categoría
  const itemsPorCategoria = safeItems.reduce((acc, item) => {
    const categoria = item.Categoria || "Sin categoría";
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {});

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        bgcolor: "#fafafa",
      }}
    >
      {/* HEADER */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "black",
          mb: 1,
          fontSize: "2.4rem",
        }}
      >
        {detalle.Nombre}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontSize: "1.05rem" }}
      >
        Estado: {detalle.EstaActivo === "1" ? "Activo" : "Inactivo"}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontSize: "1.05rem" }}
      >
        Día(s):{" "}
        {detalle.Disponibilidad?.map((d) => d.DiaSemana).join(", ") ||
          "No definido"}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: "1.05rem",
          mb: 2,
        }}
      >
        Horario: {detalle.HoraInicio} - {detalle.HoraFin}
      </Typography>

      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/menu")}
        sx={{
          mb: 4,
          color: "#FF8C00",
          borderColor: "#FF8C00",
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": {
            borderColor: "#E67E00",
            backgroundColor: "#FFF3E0",
          },
        }}
      >
        Volver al listado
      </Button>

      {/* CATEGORÍAS */}
      {Object.entries(itemsPorCategoria).map(([categoria, productos]) => (
        <Box key={categoria} sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              borderBottom: "2px solid #ddd",
              pb: 1,
              fontSize: "1.6rem",
            }}
          >
            {categoria}
          </Typography>

          <Grid container spacing={3} alignItems="stretch">
            {productos.map((item, index) => (
              <Grid
                key={`${categoria}-${index}`}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
                sx={{ display: "flex" }}
              >
                <Card
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 4,
                    boxShadow: "0 10px 20px rgba(0,0,0,.12)",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 16px 28px rgba(0,0,0,.18)",
                    },
                  }}
                >
                  {(item.Imagen || item.ImagenProducto || item.ImagenCombo) && (
                    <Box
                      component="img"
                      src={`${API_URL}${
                        item.Imagen || item.ImagenProducto || item.ImagenCombo
                      }`}
                      alt={item.Nombre || item.NombreItem}
                      sx={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        borderRadius: "16px 16px 0 0",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "1.25rem",
                      }}
                    >
                      {item.Nombre || item.NombreItem}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        fontSize: "1rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.Descripcion}
                    </Typography>

                    {/* PRECIO */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: "auto",
                        pt: 2,
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Precio
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: "black",
                          fontSize: "1.3rem",
                        }}
                      >
                        ₡{item.Precio || item.PrecioEspecial}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
