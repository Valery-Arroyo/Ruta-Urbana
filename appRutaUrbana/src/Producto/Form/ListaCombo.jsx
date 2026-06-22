import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComboService from "../../services/ComboService";

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Box,
} from "@mui/material";

import ZoomInIcon from "@mui/icons-material/ZoomIn";

export default function ListCombosPublic() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  React.useEffect(() => {
    ComboService.getCombos()
      .then((response) => {
        const raw = response.data || [];

        const agrupado = raw.reduce((acc, item) => {
          let combo = acc.find((c) => c.IdCombo === item.IdCombo);

          if (!combo) {
            combo = {
              IdCombo: item.IdCombo,
              NombreCombo: item.NombreCombo, // ✅ corrección aquí
              Descripcion: item.Descripcion,
              PrecioEspecial: item.PrecioEspecial,
              RutaImagen: item.RutaImagen,
              productos: [],
            };
            acc.push(combo);
          }

          combo.productos.push({
            IdProducto: item.IdProducto,
            Nombre: item.NombreProducto,
            Cantidad: item.Cantidad,
          });

          return acc;
        }, []);

        setData(agrupado);
      })
      .catch((error) => {
        console.error("Error cargando combos:", error);
        setData([]);
      });
  }, []);

  const detalle = (id) => {
    navigate(`/combos/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 2 }}>
        Nuestros Combos
      </Typography>

      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Registros encontrados: {data.length}
      </Typography>

      <Grid container spacing={4}>
        {data.map((combo) => (
          <Grid key={combo.IdCombo} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={`http://localhost:81/apirutaurbana/${combo.RutaImagen}`}
                alt={combo.NombreCombo}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  align="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  {combo.NombreCombo} {/* ✅ ahora sí se muestra */}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    minHeight: 60,
                    textAlign: "center",
                  }}
                >
                  {combo.Descripcion}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Tooltip title="Ver detalle">
                  <IconButton
                    color="success"
                    onClick={() => detalle(combo.IdCombo)}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
