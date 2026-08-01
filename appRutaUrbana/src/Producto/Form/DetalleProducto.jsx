import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductoService from "../../services/ProductoService";

import {
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  Button,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DetalleProducto() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productoDelDiaId, setProductoDelDiaId] = useState(null);

  useEffect(() => {
    ProductoService.getProducto(id)
      .then((response) => {
        setProducto(response.data[0]);
        console.log(response.data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener detalle:", error);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    ProductoService.getProductoDelDia()
      .then((response) => {
        setProductoDelDiaId(response.data?.IdProducto ?? null);
      })
      .catch((error) => {
        console.error("Error cargando producto del día", error);
      });
  }, []);

  const esProductoDelDia =
    productoDelDiaId !== null &&
    Number(id) === Number(productoDelDiaId);

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

  if (!producto)
    return <Typography>{t("productDetail.notFound")}</Typography>;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          minHeight: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,

          bgcolor: esProductoDelDia ? "#111111" : "background.paper",
          color: esProductoDelDia ? "#FFFFFF" : "inherit",

          border: esProductoDelDia
            ? "3px solid #FF8C00"
            : "2px solid #FF8C00",

          boxShadow: esProductoDelDia
            ? "0 10px 30px rgba(255,140,0,0.45)"
            : "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        {esProductoDelDia && (
          <Box
            sx={{
              bgcolor: "#000000",
              color: "#FF8C00",
              textAlign: "center",
              py: 1.2,
              px: 1,
              mb: 2,
              mx: -3,
              mt: -3,
              fontWeight: "bold",
              letterSpacing: "0.12rem",
              fontSize: "0.9rem",
              borderBottom: "1px solid rgba(255,140,0,.45)",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            ⭐ {t("products.productOfTheDay")} ⭐
          </Box>
        )}

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            alignSelf: "flex-start",
            color: esProductoDelDia ? "#FFFFFF" : "black",
            borderColor: esProductoDelDia ? "#FFFFFF" : "black",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              borderColor: esProductoDelDia ? "#FF8C00" : "black",
              backgroundColor: esProductoDelDia
                ? "rgba(255,255,255,.08)"
                : "#FFF3E0",
            },
          }}
        >
          {t("actions.back")}
        </Button>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CardMedia
            component="img"
            image={`http://localhost:81/apirutaurbana/${producto.Imagen}`}
            alt={producto.Nombre}
            sx={{
              width: 300,
              height: 300,
              minHeight: 300,
              maxHeight: 300,
              objectFit: "cover",
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
        </Box>

        <Typography
          variant="body1"
          sx={{
            mt: 2,
            fontSize: "1.05rem",
            color: esProductoDelDia ? "rgba(255,255,255,.75)" : "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          {t("productDetail.category")}: {producto.NombreCategoria}
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
          {producto.Nombre}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mt: 1,
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          {producto.Descripcion}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mt: 3,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {t("productDetail.ingredients")}
        </Typography>

        {producto.Ingredientes?.map((ingrediente) => (
          <Typography
            key={ingrediente.IdIngrediente}
            variant="body2"
            sx={{
              fontSize: "1rem",
              py: 0.3,
            }}
          >
            • {ingrediente.Nombre}
          </Typography>
        ))}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            pt: 2,
            borderTop: esProductoDelDia
              ? "1px solid rgba(255,255,255,.2)"
              : "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
            }}
          >
            {t("productDetail.price")}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: esProductoDelDia ? "#FF8C00" : "black",
              fontSize: "1.7rem",
            }}
          >
            ₡
            {Number(producto.Precio).toLocaleString("es-CR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
