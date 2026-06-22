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
        const data = response.data || [];

        if (!Array.isArray(data) || data.length === 0) {
          setCombo(null);
          setLoading(false);
          return;
        }

        const base = data[0];

        const productos = data.map((item) => ({
          IdProducto: item.IdProducto,
          Nombre: item.NombreProducto,
          Cantidad: item.Cantidad,
        }));

        setCombo({
          IdCombo: base.IdCombo,
          Nombre: base.NombreCombo,
          Descripcion: base.Descripcion,
          PrecioEspecial: base.PrecioEspecial,
          RutaImagen: base.RutaImagen,
          NombreCategoria: base.NombreCategoria,
          productos,
        });

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
      <Card sx={{ maxWidth: 600, p: 2, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CardMedia
            component="img"
            image={`http://localhost:81/apirutaurbana/${combo.RutaImagen}`}
            alt={combo.Nombre}
            sx={{ width: 300, height: 300, objectFit: "cover" }}
          />
        </Box>

        <Typography variant="body1" sx={{ mt: 2 }}>
          Categoría: {combo.NombreCategoria}
        </Typography>

        <Typography variant="h3">{combo.Nombre}</Typography>

        <Typography variant="body1">{combo.Descripcion}</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Productos
        </Typography>

        {combo.productos.map((p, index) => (
          <Typography
            key={`${combo.IdCombo}-${p.IdProducto}-${index}`}
            variant="body2"
          >
            • {p.Nombre} x{p.Cantidad}
          </Typography>
        ))}

        <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
          ₡{combo.PrecioEspecial}
        </Typography>
      </Card>
    </Box>
  );
}
