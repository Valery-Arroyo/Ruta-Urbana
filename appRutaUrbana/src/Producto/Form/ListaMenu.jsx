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

// Componente para listar los menús
export default function ListMenus() {

  // Estado para almacenar los menús y el estado de carga
  const [menus, setMenus] = useState([]);

  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);

  // Hook de navegación para redirigir a la página de detalle del menú
  const navigate = useNavigate();

  // Efecto para cargar los menús al montar el componente
  useEffect(() => {
    MenuService.getMenus()
      .then((response) => {
        console.log(response.data);

        //
        const sortedMenus = response.data.sort((a, b) => {
          if (b.EstaActivo !== a.EstaActivo) {
            return b.EstaActivo - a.EstaActivo;
          }

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

    if (String(menu.EstaActivo) !== "1") {
      return false;
    }

    const [hIni, mIni, sIni] = menu.HoraInicio.split(":").map(Number);
    const [hFin, mFin, sFin] = menu.HoraFin.split(":").map(Number);

    const horaInicio = new Date(ahora);
    horaInicio.setHours(hIni, mIni, sIni, 0);

    const horaFin = new Date(ahora);
    horaFin.setHours(hFin, mFin, sFin, 0);

    const horarioValido =
      ahora >= horaInicio &&
      ahora <= horaFin;

    if (!horarioValido) {
      return false;
    }

    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const diaActual = diasSemana[ahora.getDay()];

    if (
      menu.DiasDisponibles &&
      menu.DiasDisponibles.trim() !== ""
    ) {
      return menu.DiasDisponibles
        .split(",")
        .map((d) => d.trim())
        .includes(diaActual);
    }

    return true;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 10,
        }}
      >
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
        sx={{
          fontWeight: "bold",
          color: "#2c3e50",
        }}
      >
        Todos los Menús
      </Typography>

      <Grid container spacing={3}>
        {menus.map((menu) => {
          const disponible = isDisponibleAhora(menu);

          return (
            <Grid
              key={menu.IdMenu}
              item
              xs={12}
              sm={6}
              md={4}
              sx={{ display: "flex" }}
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
                      String(menu.EstaActivo) === "1"
                        ? "success.main"
                        : "error.main"
                    }
                    sx={{ mb: 1 }}
                  >
                    Estado:{" "}
                    {String(menu.EstaActivo) === "1"
                      ? "Activo"
                      : "Inactivo"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Horario: {menu.HoraInicio} - {menu.HoraFin}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Días: {menu.DiasDisponibles || "Sin restricción"}
                  </Typography>

                  <Box sx={{ mt: 2, textAlign: "right" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() =>
                        navigate(`/menu/${menu.IdMenu}`)
                      }
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