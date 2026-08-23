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

// Componente para mostrar el detalle de un producto
export default function DetalleProducto() {

  // Se obtienen las funciones de traducción y navegación, 
  // así como el ID del producto desde los parámetros de la URL
  const { t } = useTranslation();

  // Se obtiene el ID del producto desde los parámetros de la URL
  const { id } = useParams();

  // Se inicializa el hook de navegación para permitir regresar a la página anterior
  const navigate = useNavigate();

  // Estados locales para almacenar la información del producto,
  const [producto, setProducto] = useState(null);

  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);

  // Estado para almacenar el ID del producto del día
  const [productoDelDiaId, setProductoDelDiaId] = useState(null);

  // useEffect para obtener los datos del producto y del producto del día al montar el componente
  useEffect(() => {

    // Se llama al servicio para obtener el detalle del producto por su ID
    ProductoService.getProducto(id)

    // Se llama al servicio para obtener el detalle del producto por su ID
      .then((response) => {

        // Se establece el estado del producto con la información obtenida
        setProducto(response.data[0]);

        // Se detiene la carga después de obtener los datos
        console.log(response.data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener detalle:", error);
        setLoading(false);
      });

    // Se llama al servicio para obtener el ID del producto del día
    ProductoService.getProductoDelDia()
      .then((response) => {

        // Se establece el estado con el ID del producto del día,
        setProductoDelDiaId(response.data?.IdProducto ?? null);
      })
      .catch(() => setProductoDelDiaId(null));
  }, [id]);

  // Se determina si el producto actual es el producto del día comparando los IDs
  const esProductoDelDia =
    producto &&
    productoDelDiaId !== null &&
    Number(producto.IdProducto) === Number(productoDelDiaId);

    // Se renderiza el componente, mostrando un indicador de carga mientras se obtienen los datos
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
          border: esProductoDelDia ? "3px solid #FF8C00" : "2px solid #FF8C00",
          boxShadow: esProductoDelDia
            ? "0 10px 28px rgba(255, 140, 0, 0.45)"
            : "0 10px 25px rgba(0,0,0,0.15)",
          bgcolor: esProductoDelDia ? "#111111" : "#FFFFFF",
          color: esProductoDelDia ? "#FFFFFF" : "inherit",
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
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottom: "1px solid rgba(255,140,0,.45)",
            }}
          >
            ⭐ {t("products.productOfTheDay")} ⭐
          </Box>
        )}

        <Button

        // Botón para regresar a la página anterior, con estilo condicional según si es producto del día
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
              borderColor: esProductoDelDia ? "#FFFFFF" : "black",
              backgroundColor: esProductoDelDia
                ? "rgba(255,255,255,.12)"
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
            color: esProductoDelDia ? "#FFFFFF" : "inherit",
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
            color: esProductoDelDia ? "rgba(255,255,255,.85)" : "inherit",
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
            color: esProductoDelDia ? "#FFFFFF" : "inherit",
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
              color: esProductoDelDia ? "rgba(255,255,255,.85)" : "inherit",
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
              ? "1px solid rgba(255,255,255,.12)"
              : "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: esProductoDelDia ? "#FFFFFF" : "inherit",
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
