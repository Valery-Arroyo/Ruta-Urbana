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
  console.log("ListCombosPublic cargado");
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  React.useEffect(() => {
    console.log("useEffect ejecutado");
    ComboService.getCombos()
      .then((response) => {
        console.log("Respuesta cruda:", response);
        if (Array.isArray(response.data)) {
          setData(response.data);
          console.log(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
          console.log(response.data.data);
        } else if (response.data) {
          setData([response.data]);
          console.log(response.data);
        } else {
          setData([]);
          console.log(response.data);
        }
      })
      .catch((error) => console.error("Error cargando combos:", error));
  }, []);

  const detalle = (id) => {
    navigate(`/combos/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        Nuestros Combos
      </Typography>

      <Grid container spacing={4}>
        {data.map((row) => (
          <Grid key={row.IdCombo} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                image={`http://localhost:81/apirutaurbana/${row.Imagen}`}
                alt={row.Nombre}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  align="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  {row.Nombre}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    minHeight: 60,
                    textAlign: "center",
                  }}
                >
                  {row.Descripcion}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: "center",
                  pb: 2,
                }}
              >
                <Tooltip title="Ver detalle">
                  <IconButton
                    color="success"
                    onClick={() => detalle(row.IdCombo)}
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
