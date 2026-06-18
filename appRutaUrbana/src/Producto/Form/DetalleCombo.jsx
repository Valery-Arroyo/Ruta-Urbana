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
          // Tomamos el primer elemento porque la información del combo es idéntica en todos
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
    <Card sx={{ maxWidth: 600, p: 2 }}>
      {/* Si tienes una columna ImagenCombo o similar, reemplaza combo.Imagen */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CardMedia
          component="img"
          image={`http://localhost:81/apirutaurbana/${combo.ImagenCombo || combo.Imagen || ""}`}
          alt={combo.NombreCombo}
          sx={{
            width: 300,
            height: 300,
            objectFit: "cover",
          }}
        />
      </Box>

      <Typography variant="body1">Categoría: {combo.IdCategoria}</Typography>

      {/* Cambiados los nombres de las propiedades para que coincidan con tu JSON */}
      <Typography variant="h3">{combo.NombreCombo}</Typography>

      <Typography variant="body1">{combo.DescripcionCombo}</Typography>

      <Typography variant="h5" color="primary">
        Precio: ${combo.PrecioEspecial}
      </Typography>
    </Card>
  );
}