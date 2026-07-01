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

        const resultadoFinal = Object.values(agrupado).map((e) => {
          e.pasos.sort((a, b) => a.OrdenPaso - b.OrdenPaso);
          return e;
        });

        setData(resultadoFinal);
      })
      .catch((error) => {
        console.error("Error al obtener las preparaciones:", error);
      });
  }, []);

  const handleDetail = (idProducto, idCombo) => {
    if (idProducto) navigate(`/preparacion/${idProducto}`);
    else navigate(`/preparacion/combo/${idCombo}`);
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* CONTENEDOR CENTRADO (clave para quitar espacio blanco) */}
      <Box sx={{ width: "100%", maxWidth: "1200px" }}>
        <Typography
          variant="h3"
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "#FF8C00",
            textAlign: "center",
            fontSize: "2.3rem",
          }}
        >
          Procesos de Preparación
        </Typography>

        <Grid container spacing={2}>
          {data.map((item) => (
            <Grid
              key={`${item.esProducto ? "prod" : "combo"}-${item.IdProducto || item.IdCombo}`}
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
                  display: "flex",
                  flexDirection: "column",
                  p: 1.5,
                  transition: "0.2s",
                  minHeight: 120,
                  "&:hover": {
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.05rem",
                      mb: 1,
                    }}
                  >
                    {item.Nombre}
                  </Typography>

                  <Chip
                    label={`Pasos: ${item.totalPasos}`}
                    size="small"
                    color={item.esProducto ? "primary" : "success"}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  />
                </CardContent>

                <CardActions
                  sx={{
                    justifyContent: "flex-end",
                    p: 0,
                    mt: 1,
                  }}
                >
                  <IconButton
                    onClick={() => handleDetail(item.IdProducto, item.IdCombo)}
                    sx={{ color: "#000" }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
