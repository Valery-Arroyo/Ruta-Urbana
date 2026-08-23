import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import MenuService from "../../services/MenuService";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Componente para mostrar el detalle de un menú
const API_URL = import.meta.env.VITE_BASE_URL;

// Componente para mostrar el detalle de un menú
export default function DetalleMenu() {
  const { t } = useTranslation();

  // Obtener el ID del menú desde los parámetros de la URL
  const { id } = useParams();

  // Obtener la función de navegación para redirigir a otras páginas
  const navigate = useNavigate();

  // Estado local para manejar el detalle del menú y el estado de carga
  const [detalle, setDetalle] = useState(null);

  // Estado local para manejar el estado de carga mientras se obtiene el detalle del menú
  const [loading, setLoading] = useState(true);

  // useEffect para obtener el detalle del menú al montar el componente
  useEffect(() => {
    MenuService.get(id)
      .then((response) => {
        console.log("DETALLE DEL MENÚ:", response.data);
        console.log("PRODUCTOS:", response.data.Productos);
        console.log("COMBOS:", response.data.Combos);

        // Se establece el estado del detalle del menú con la respuesta del backend
        setDetalle(response.data);
      })
      .catch((error) => {
        console.error("Error cargando detalle:", error);
        console.error("Respuesta del backend:", error.response?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);


  // Función para formatear la hora en formato de 12 horas con AM/PM
  const formatearHora = (hora) => {
    if (!hora) return t("menus.detail.notDefined");

    const [horaTexto, minutos = "00"] = String(hora).split(":");

    let horaNumero = Number(horaTexto);

    if (Number.isNaN(horaNumero)) {
      return hora;
    }

    const periodo = horaNumero >= 12 ? "p. m." : "a. m.";

    horaNumero = horaNumero % 12 || 12;

    return `${horaNumero}:${minutos} ${periodo}`;
  };

  // Función para formatear el precio en colones costarricenses sin decimales
  const formatearPrecio = (precio) => {
    const precioNumero = Number(precio);

    if (Number.isNaN(precioNumero)) {
      return "0";
    }

    return precioNumero.toLocaleString("es-CR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Función para obtener la URL de la imagen del producto o combo, manejando rutas relativas y absolutas
  const obtenerUrlImagen = (item) => {
    const imagen =
      item.ImagenProducto || item.ImagenCombo || item.Imagen || item.RutaImagen;

    if (!imagen) {
      return "/no-image.png";
    }

    const rutaLimpia = String(imagen)
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");


      // Se verifica si la ruta es absoluta (comienza con http:// o https://) y se devuelve tal cual
    if (rutaLimpia.startsWith("http://") || rutaLimpia.startsWith("https://")) {
      return rutaLimpia;
    }

    const baseLimpia = String(API_URL).endsWith("/") ? API_URL : `${API_URL}/`;

    return `${baseLimpia}${rutaLimpia}`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress
          size={55}
          sx={{
            color: "#FF8C00",
          }}
        />
      </Box>
    );
  }

  // Si no se encuentra el detalle del menú, se muestra un mensaje de error y un botón para regresar a la lista de menús
  if (!detalle) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >

        // Se muestra un mensaje de error indicando que no se pudo cargar el detalle del menú
        <Typography variant="h5">{t("menus.detail.loadError")}</Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/menu")}
        >
          {t("menus.detail.backToList")}
        </Button>
      </Box>
    );
  }

  // Se obtienen los productos y combos del detalle del menú, asegurando que sean arreglos válidos
  const productos = Array.isArray(detalle.Productos) ? detalle.Productos : [];

  // Se obtienen los combos del detalle del menú, asegurando que sean arreglos válidos
  const combos = Array.isArray(detalle.Combos) ? detalle.Combos : [];

  // Se combinan los productos y combos en un solo arreglo para su posterior procesamiento
  const safeItems = [...productos, ...combos];

  const itemsPorCategoria = safeItems.reduce((acc, item) => {
    const categoria =
      item.Categoria || item.NombreCategoria || t("menus.detail.otherCategory");

    if (!acc[categoria]) {
      acc[categoria] = [];
    }

    acc[categoria].push(item);

    return acc;
  }, {});

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        bgcolor: "#fafafa",
      }}
    >

      // Se muestra el nombre del menú en un estilo destacado
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "black",
          mb: 1,
          fontSize: "2.4rem",
        }}
      >
        {detalle.Nombre}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: "1.05rem",
        }}
      >
        {t("menus.detail.status")}:{" "}
        {String(detalle.EstaActivo) === "1"
          ? t("menus.detail.active")
          : t("menus.detail.inactive")}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: "1.05rem",
        }}
      >

        // Se muestra la información de los días disponibles del menú, 
        // o un mensaje indicando que no se han definido días
        {t("menus.detail.days")}:{" "}
        {detalle.DiasDisponibles?.trim()
          ? detalle.DiasDisponibles
          : t("menus.detail.noDaysDefined")}
      </Typography>

      // Se muestra la información de la validez del menú, 
      // incluyendo las fechas de inicio y fin, o mensajes indicando que no se han definido
      {(detalle.FechaInicio || detalle.FechaFin) && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: "1.05rem",
          }}
        >
          {t("menus.detail.validity")}:{" "}
          {detalle.FechaInicio || t("menus.detail.noStartDate")}
          {" - "}
          {detalle.FechaFin || t("menus.detail.noEndDate")}
        </Typography>
      )}

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: "1.05rem",
          mb: 2,
        }}
      >
        {t("menus.detail.schedule")}: {formatearHora(detalle.HoraInicio)}
        {" - "}
        {formatearHora(detalle.HoraFin)}
      </Typography>

      <Button

      // Se muestra un botón para regresar a la lista de menús, con estilo personalizado
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/menu")}
        sx={{
          mb: 4,
          color: "#FF8C00",
          borderColor: "#FF8C00",
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "1rem",

          "&:hover": {
            borderColor: "#E67E00",
            backgroundColor: "#FFF3E0",
          },
        }}
      >

        // Se muestra el texto del botón para regresar a la lista de menús, 
        // traducido según el idioma seleccionado
        {t("menus.detail.backToList")}
      </Button>


      {safeItems.length === 0 && (
        <Typography
          align="center"
          sx={{
            mt: 5,
            fontSize: "1.2rem",
            color: "text.secondary",
          }}
        >
          {t("menus.detail.noItems")}
        </Typography>
      )}

      // Se muestran los productos y combos agrupados por categoría, 
      // con estilo de tarjeta para cada elemento
      {Object.entries(itemsPorCategoria).map(([categoria, items]) => (
        <Box
          key={categoria}
          sx={{
            mb: 5,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              borderBottom: "2px solid #ddd",
              pb: 1,
              fontSize: "1.6rem",
            }}
          >
            {categoria}
          </Typography>

          <Box
            sx={{
              display: "grid",
              justifyContent: "center",
              gap: 3,

              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2,320px)",
                md: "repeat(3,320px)",
                lg: "repeat(4,320px)",
              },
            }}
          >
            {items.map((item, index) => (
              <Card
                key={`${
                  item.IdProducto
                    ? `producto-${item.IdProducto}`
                    : `combo-${item.IdCombo}`
                }-${index}`}
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 10px 20px rgba(0,0,0,.12)",
                    transition: "0.3s",

                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 16px 28px rgba(0,0,0,.18)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <Box
                      component="img"
                      src={obtenerUrlImagen(item)}
                      alt={item.Nombre || item.NombreItem || "Imagen"}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/no-image.png";
                      }}
                      sx={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />

                    <Chip
                      label={`₡${formatearPrecio(item.Precio ?? item.PrecioEspecial)}`}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        bgcolor: "#FF8C00",
                        color: "#111111",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        boxShadow: "0 3px 10px rgba(0,0,0,.35)",
                      }}
                    />
                  </Box>

                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "1.25rem",
                      }}
                    >
                      {item.Nombre || item.NombreItem || t("menus.detail.noName")}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        fontSize: "1rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.Descripcion || t("menus.detail.noDescription")}
                    </Typography>
                  </CardContent>
                </Card>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
