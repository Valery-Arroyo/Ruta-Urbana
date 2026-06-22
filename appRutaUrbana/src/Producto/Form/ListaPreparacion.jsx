import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PreparacionService from "../../services/PreparacionService";

import {
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Box,
  Chip,
} from "@mui/material";

import ZoomInIcon from "@mui/icons-material/ZoomIn";

export default function ListPreparacionPublic() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    PreparacionService.getPreparaciones()
      .then((response) => {
        const agrupado = response.data.reduce((acc, item) => {
          const idProd = item.IdProducto || item.idProducto || item.idproducto;
          const idCombo = item.IdCombo || item.idCombo || item.idcombo;

          const key = idProd ? `prod-${idProd}` : `combo-${idCombo}`;

          if (!acc[key]) {
            acc[key] = {
              Nombre: item.NombreProducto || item.NombreCombo || "Sin Nombre",
              IdProducto: idProd || null,
              IdCombo: idCombo || null,
              esProducto: !!idProd,
              pasos: [],
              totalPasos: 0,
            };
          }

          acc[key].pasos.push({
            OrdenPaso: item.OrdenPaso,
            NombreEstacion: item.NombreEstacion,
            TiempoEstimadoMinutos: item.TiempoEstimadoMinutos,
          });

          acc[key].totalPasos++;
          return acc;
        }, {});

        const resultadoFinal = Object.values(agrupado).map((elemento) => {
          elemento.pasos.sort((a, b) => a.OrdenPaso - b.OrdenPaso);
          return elemento;
        });

        setData(resultadoFinal);
      })
      .catch((error) => {
        console.error("Error al obtener las preparaciones:", error);
      });
  }, []);

  const handleDetail = (idProducto, idCombo) => {
    if (idProducto) {
      navigate(`/preparacion/${idProducto}`);
    } else {
      navigate(`/preparacion/combo/${idCombo}`);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 4, fontWeight: "bold" }}
      >
        Procesos de Preparación
      </Typography>

      {/* Grid container con alignItems="stretch" para alinear filas */}
      <Grid container spacing={3} alignItems="stretch">
        {data.map((item, index) => (
          /* Grid item con display="flex" para que la Card llene la celda */
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: "flex" }}>
            <Card
              sx={{
                width: "100%", // Asegura que llene el ancho de la columna
                display: "flex",
                flexDirection: "column", // Organiza contenido en columna
                boxShadow: 3,
              }}
            >
              {/* flexGrow: 1 hace que este contenedor crezca para ocupar el espacio sobrante */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  {item.Nombre}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Total de pasos: ${item.totalPasos}`}
                    color={item.esProducto ? "primary" : "success"}
                    variant="filled"
                  />
                </Box>
              </CardContent>

              {/* Las acciones siempre quedarán fijas al fondo */}
              <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                <Tooltip title="Ver detalle completo">
                  <IconButton
                    sx={{ color: "black" }}
                    onClick={() => handleDetail(item.IdProducto, item.IdCombo)}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {data.length === 0 && (
          <Grid item xs={12}>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              No hay procesos de preparación disponibles en este momento.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
