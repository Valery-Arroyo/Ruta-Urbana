import * as React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ComboService from "../../services/ComboService";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
} from "@mui/material";

export default function DetalleCombo() {
  const { id } = useParams();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ComboService.getCombo(id)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCombo(response.data[0]);
        } else {
          setCombo(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener detalle:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!combo) return <Typography>Combo no encontrado.</Typography>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 600, p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CardMedia
            component="img"
            image={`http://localhost:81/apirutaurbana/${
              combo.RutaImagen || combo.ImagenCombo || combo.Imagen || ""
            }`}
            alt={combo.NombreCombo}
            sx={{
              width: 300,
              height: 300,
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        </Box>

        <Typography variant="body1" sx={{ mt: 2 }}>
          Categoría: {combo.IdCategoria}
        </Typography>

        <Typography variant="h3" sx={{ mt: 1 }}>
          {combo.NombreCombo}
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          {combo.DescripcionCombo}
        </Typography>

        <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
          Precio: ${combo.PrecioEspecial}
        </Typography>
      </Card>
    </Box>
  );
}
