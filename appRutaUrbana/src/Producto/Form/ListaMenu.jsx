import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 para navegación
import MenuService from "../../services/MenuService";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
} from "@mui/material";

export default function ListMenus() {
  const [menus, setMenus] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    MenuService.getMenus()
      .then((response) => {
        console.log("MENÚS:", response.data);
        console.log("MENU COMPLETO:", menus);
        setMenus(response.data);
      })
      .catch((error) => {
        console.error("Error cargando los menús:", error);
      });
  }, []);

  // Función para validar si el menú está disponible según hora actual
  const isDisponibleAhora = (menu) => {
    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0, 8); // HH:mm:ss

    return (
      horaActual >= menu.HoraInicio &&
      horaActual <= menu.HoraFin &&
      menu.EstaActivo === "1"
    );
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#fdfdfd", minHeight: "100vh" }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#2c3e50" }}
      >
        Todos los Menús
      </Typography>

      <Grid container spacing={3}>
        {menus.map((menu) => {
          const disponible = isDisponibleAhora(menu);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={menu.IdMenu}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  p: 2,
                  opacity: disponible ? 1 : 0.5,
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {menu.Nombre}
                  </Typography>

                  <Typography
                    variant="body2"
                    color={
                      menu.EstaActivo === "1" ? "success.main" : "error.main"
                    }
                    sx={{ mb: 1 }}
                  >
                    Estado: {menu.EstaActivo === "1" ? "Activo" : "Inactivo"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Horario: {menu.HoraInicio} - {menu.HoraFin}
                  </Typography>

                  <Box sx={{ mt: 2, textAlign: "right" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/menu/${menu.IdMenu}`)}
                      disabled={!disponible}
                    >
                      Ver detalle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
