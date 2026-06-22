import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ListMenus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    MenuService.getMenus()
      .then((response) => {
        const sortedMenus = response.data.sort((a, b) => {
          if (b.EstaActivo !== a.EstaActivo) return b.EstaActivo - a.EstaActivo;
          return b.IdMenu - a.IdMenu;
        });
        setMenus(sortedMenus);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando los menús:", error);
        setLoading(false);
      });
  }, []);

  const isDisponibleAhora = (menu) => {
    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0, 8);

    return (
      horaActual >= menu.HoraInicio &&
      horaActual <= menu.HoraFin &&
      menu.EstaActivo === "1"
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {/* FIX: alignItems pasa a sx */}
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        {menus.map((menu) => {
          const disponible = isDisponibleAhora(menu);

          return (
            <Grid
              key={menu.IdMenu}
              sx={{ width: "100%", display: "flex" }}
              size={{ xs: 12, sm: 6, md: 4 }}
            >
              <Card
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  p: 2,
                  opacity: disponible ? 1 : 0.6,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
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
