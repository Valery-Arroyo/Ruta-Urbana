import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

// Componente para mostrar el detalle de un combo
export default function DetalleCombo() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect para obtener el detalle del combo al montar el componente
  useEffect(() => {
    // Se llama al servicio para obtener el detalle del combo por su ID
    ComboService.getCombo(id)
      .then((response) => {
        const data = response.data || [];

        // Si no se encuentra el combo, se establece el estado en null y se detiene la carga
        if (!Array.isArray(data) || data.length === 0) {
          setCombo(null);
          setLoading(false);
          return;
        }

        // Se obtiene la información del combo y sus productos asociados
        const base = data[0];

        // Se mapea la lista de productos del combo para obtener solo la información necesaria
        const productos = data.map((item) => ({
          IdProducto: item.IdProducto,
          Nombre: item.NombreProducto,
          Cantidad: item.Cantidad,
        }));

        // Se establece el estado del combo con la información obtenida
        setCombo({
          IdCombo: base.IdCombo,
          Nombre: base.NombreCombo,
          Descripcion: base.Descripcion,
          PrecioEspecial: base.PrecioEspecial,
          RutaImagen: base.RutaImagen,
          NombreCategoria: base.NombreCategoria,
          productos,
        });

        // Se detiene la carga después de obtener los datos
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

  if (!combo) return <Typography>{t("combos.detail.notFound")}</Typography>;

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
            color: "black",
            borderColor: "black",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              borderColor: "black",
              backgroundColor: "#FFF3E0",
            },
          }}
        >
          {t("combos.detail.back")}
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
          {t("combos.detail.category")}: {combo.NombreCategoria}
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
          {t("combos.detail.products")}
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
            {t("combos.detail.price")}
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
