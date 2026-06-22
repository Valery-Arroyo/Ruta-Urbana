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
} from "@mui/material";

const API_URL = import.meta.env.VITE_BASE_URL;

export default function DetalleMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    MenuService.getMenuDetalle(id)
      .then((response) => {
        setDetalle(response.data);
      })
      .catch((error) => {
        console.error("Error cargando detalle:", error);
      });
  }, [id]);

  if (!detalle) {
    return <Typography>Cargando detalle...</Typography>;
  }

  const { menu, items } = detalle;

  const safeItems = Array.isArray(items) ? items : [];

  const itemsPorCategoria = safeItems.reduce((acc, item) => {
    const cat = item.Categoria || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 4, bgcolor: "#fdfdfd", minHeight: "100vh" }}>
      <Typography variant="h3" gutterBottom>
        {menu?.NombreMenu}
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Estado: {menu?.EstaActivo === "1" ? "Activo" : "Inactivo"}
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Día(s): {menu?.DiasDisponibles || "No definido"}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Horario: {menu?.HoraInicio} - {menu?.HoraFin}
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        sx={{ mb: 4 }}
        onClick={() => navigate("/menu")}
      >
        Volver al listado
      </Button>

      {Object.entries(itemsPorCategoria).map(([categoria, productos]) => (
        <Box key={categoria} sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              borderBottom: "2px solid #ddd",
              pb: 1,
            }}
          >
            {categoria}
          </Typography>

          <Grid container spacing={3}>
            {productos.map((item, index) => (
              <Grid
                key={`${categoria}-${index}`}
                size={{ xs: 12, sm: 6, md: 4 }}
              >
                <Card
                  sx={{
                    height: 450,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {(item.ImagenProducto || item.ImagenCombo) && (
                      <Box
                        component="img"
                        src={`${API_URL}${
                          item.ImagenProducto || item.ImagenCombo
                        }`}
                        alt={item.NombreItem}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-combo.png";
                        }}
                        sx={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 2,
                          mb: 2,
                          bgcolor: "#f0f0f0",
                        }}
                      />
                    )}

                    <Typography variant="h6" fontWeight="bold">
                      {item.NombreItem}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        flexGrow: 1,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.Descripcion}
                    </Typography>

                    <Typography
                      variant="h6"
                      color="success.main"
                      sx={{ mt: 2 }}
                    >
                      ₡{item.Precio}
                    </Typography>
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