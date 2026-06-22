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
console.log("API_URL:", API_URL);

export default function DetalleMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    MenuService.getMenuDetalle(id)
      .then((response) => {
        console.log("DETALLE:", response.data);
        setDetalle(response.data);
      })
      .catch((error) => {
        console.error("Error cargando detalle:", error);
      });
  }, [id]);

  if (!detalle) {
    return <Typography>Cargando detalle...</Typography>;
    console.log("COMBO:", combo);
  }

  const { menu, items } = detalle;

  return (
    <Box sx={{ p: 4, bgcolor: "#fdfdfd", minHeight: "100vh" }}>
      <Typography variant="h3" gutterBottom>
        {menu.NombreMenu}
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Estado: {menu.EstaActivo === "1" ? "Activo" : "Inactivo"}
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Día(s): {menu.DiasDisponibles ? menu.DiasDisponibles : "No definido"}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Horario: {menu.HoraInicio} - {menu.HoraFin}
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        sx={{ mb: 4 }}
        onClick={() => navigate("/menu")}
      >
        Volver al listado
      </Button>

      <Grid container spacing={3}>
        {items.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              sx={{
                height: 450,
                minHeight: 450,
                maxHeight: 450,
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
                  overflow: "hidden",
                }}
              >
                {(item.ImagenProducto || item.ImagenCombo) && (
                  <Box
                    component="img"
                    src={`${API_URL}${item.ImagenProducto || item.ImagenCombo}`}
                    alt={item.NombreItem}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-combo.png";
                    }}
                    sx={{
                      width: "100%",
                      height: 180,
                      minHeight: 180,
                      maxHeight: 180,
                      display: "block",
                      objectFit: "cover",
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: "#f0f0f0",
                      flexShrink: 0,
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
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.Descripcion}
                </Typography>

                <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                  ₡{item.Precio}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Categoría: {item.Categoria}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
