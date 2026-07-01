import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComboService from "../../services/ComboService";

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Box,
  Button,
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
              NombreCombo: item.NombreCombo,
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
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          mb: 1,
          fontWeight: "bold",
          color: "#black",
          letterSpacing: 1,
        }}
      >
        Nuestros Combos
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{
          mb: 4,
          color: "text.secondary",
        }}
      >
        Descubre las mejores combinaciones al mejor precio.
      </Typography>

      <Grid container spacing={4}>
        {data.map((combo) => (
          <Grid key={combo.IdCombo} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                boxShadow: "0 10px 20px rgba(0,0,0,.12)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 16px 28px rgba(0,0,0,.18)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={`http://localhost:81/apirutaurbana/${combo.RutaImagen}`}
                alt={combo.NombreCombo}
                sx={{
                  objectFit: "cover",
                }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: "#333",
                    mb: 1,
                  }}
                >
                  {combo.NombreCombo}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    minHeight: 70,
                    textAlign: "center",
                    lineHeight: 1.6,
                    fontSize: "0.98rem",
                  }}
                >
                  {combo.Descripcion}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: "center",
                  pb: 2,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<ZoomInIcon />}
                  onClick={() => detalle(combo.IdCombo)}
                  sx={{
                    bgcolor: "#FF8C00",
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: "bold",
                    px: 3,
                    "&:hover": {
                      bgcolor: "#E67E00",
                    },
                  }}
                >
                  Ver detalle
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
