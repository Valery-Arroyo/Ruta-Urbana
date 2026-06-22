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
        // AGRUPACIÓN CORREGIDA POR PRODUCTO O COMBO ESPECÍFICO
        const agrupado = response.data.reduce((acc, item) => {
          // Detectar correctamente el ID soportando mayúsculas/minúsculas de la BD
          const idProd = item.IdProducto || item.idProducto || item.idproducto;
          const idCombo = item.IdCombo || item.idCombo || item.idcombo;
          
          // Generar una llave única real por cada elemento individual
          const key = idProd ? `prod-${idProd}` : `combo-${idCombo}`;
          
          if (!acc[key]) {
            acc[key] = {
              Nombre: item.NombreProducto || item.NombreCombo || "Sin Nombre",
              IdProducto: idProd || null,
              IdCombo: idCombo || null,
              esProducto: !!idProd,
              pasos: []
            };
          }
          
          // Insertar el paso correspondiente a este producto o combo específico
          acc[key].pasos.push({
            OrdenPaso: item.OrdenPaso,
            NombreEstacion: item.NombreEstacion,
            TiempoEstimadoMinutos: item.TiempoEstimadoMinutos
          });
          
          return acc;
        }, {});

        // Ordenar los pasos internamente para cada tarjeta por su número de paso
        const resultadoFinal = Object.values(agrupado).map(elemento => {
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
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Procesos de Preparación
      </Typography>

      <Grid container spacing={3}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: 3 }}>
              
              <CardContent>
                {/* Nombre único del Producto o Combo */}
                <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
                  {item.Nombre}
                </Typography>

                {/* Lista exclusiva de pasos pertenecientes a este artículo */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {item.pasos.map((paso, pIndex) => (
                    <Box key={pIndex} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <Chip 
                        label={`Paso ${paso.OrdenPaso}: ${paso.NombreEstacion}`} 
                        color={item.esProducto ? "primary" : "success"} 
                        variant="outlined" 
                        size="small"
                      />
                      {paso.TiempoEstimadoMinutos && (
                        <Chip 
                          label={`${paso.TiempoEstimadoMinutos} min`} 
                          color="secondary" 
                          size="small"
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                <Tooltip title="Ver detalle completo">
                  <IconButton 
                    color="primary" 
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
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
              No hay procesos de preparación disponibles en este momento.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}