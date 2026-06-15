import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";

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

export default function ListProductosPublic() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  React.useEffect(() => {
    ProductoService.getProductos()
      .then((response) => {
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else if (response.data) {
          setData([response.data]);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error("Error cargando productos:", error));
  }, []);

  const detalle = (id) => {
    navigate(`/productos/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        Nuestros Productos 
      </Typography>

      <Grid container spacing={4}>
        {data.map((row) => (
          <Grid key={row.IdProducto} size={{ xs: 12, sm: 6, md: 4, lg: 3  }}>
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
                    onClick={() => detalle(row.IdProducto)}
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
