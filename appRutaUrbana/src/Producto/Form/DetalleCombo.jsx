import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ComboService from "../../services/ComboService";

import {
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DetalleCombo() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={55} sx={{ color: "#FF8C00" }} />
      </Box>
    );

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
      <Card
        sx={{
          maxWidth: 600,
          p: 3,
          borderRadius: 4,
          border: "2px solid #FF8C00",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            color: "#FF8C00",
            borderColor: "#FF8C00",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              borderColor: "#E67E00",
              backgroundColor: "#FFF3E0",
            },
          }}
        >
          Volver
        </Button>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CardMedia
            component="img"
            image={`http://localhost:81/apirutaurbana/${combo.RutaImagen}`}
            alt={combo.Nombre}
            sx={{
              width: 300,
              height: 300,
              objectFit: "cover",
              borderRadius: 3,
            }}
          />
        </Box>

        <Typography
          variant="body1"
          sx={{
            mt: 2,
            fontSize: "1.05rem",
            color: "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          Categoría: {combo.NombreCategoria}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            mt: 1,
            fontSize: "2.2rem",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {combo.Nombre}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mt: 1,
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          {combo.Descripcion}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mt: 3,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Productos
        </Typography>

        {combo.productos.map((p, index) => (
          <Typography
            key={`${combo.IdCombo}-${p.IdProducto}-${index}`}
            variant="body2"
            sx={{
              fontSize: "1rem",
              py: 0.3,
            }}
          >
            • {p.Nombre} × {p.Cantidad}
          </Typography>
        ))}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            pt: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
            }}
          >
            Precio
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "black",
              fontSize: "1.7rem",
            }}
          >
            ₡{Number(combo.PrecioEspecial).toLocaleString("es-CR")}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
