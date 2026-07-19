import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import MenuService from "../../services/MenuService";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_URL = import.meta.env.VITE_BASE_URL;

export default function DetalleMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MenuService.get(id)
      .then((response) => {
        console.log("DETALLE DEL MENÚ:", response.data);
        console.log("PRODUCTOS:", response.data.Productos);
        console.log("COMBOS:", response.data.Combos);

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

  const formatearHora = (hora) => {
    if (!hora) return "No definida";

    const [horaTexto, minutos = "00"] = String(hora).split(":");

    let horaNumero = Number(horaTexto);

    if (Number.isNaN(horaNumero)) {
      return hora;
    }

    const periodo = horaNumero >= 12 ? "p. m." : "a. m.";

    horaNumero = horaNumero % 12 || 12;

    return `${horaNumero}:${minutos} ${periodo}`;
  };

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
        <Typography variant="h5">No fue posible cargar el menú.</Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/menu")}
        >
          Volver al listado
        </Button>
      </Box>
    );
  }

  const productos = Array.isArray(detalle.Productos) ? detalle.Productos : [];

  const combos = Array.isArray(detalle.Combos) ? detalle.Combos : [];

  const safeItems = [...productos, ...combos];

  /*
   * Agrupar productos y combos por categoría.
   */
  const itemsPorCategoria = safeItems.reduce((acc, item) => {
    const categoria = item.Categoria || item.NombreCategoria || "Sin categoría";

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
      {/* ENCABEZADO */}

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
        Estado: {String(detalle.EstaActivo) === "1" ? "Activo" : "Inactivo"}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: "1.05rem",
        }}
      >
        Día(s):{" "}
        {detalle.DiasDisponibles?.trim()
          ? detalle.DiasDisponibles
          : "No definido"}
      </Typography>

      {(detalle.FechaInicio || detalle.FechaFin) && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: "1.05rem",
          }}
        >
          Vigencia: {detalle.FechaInicio || "Sin fecha inicial"}
          {" - "}
          {detalle.FechaFin || "Sin fecha final"}
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
        Horario: {formatearHora(detalle.HoraInicio)}
        {" - "}
        {formatearHora(detalle.HoraFin)}
      </Typography>

      <Button
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
        Volver al listado
      </Button>

      {/* MENÚ SIN ELEMENTOS */}

      {safeItems.length === 0 && (
        <Typography
          align="center"
          sx={{
            mt: 5,
            fontSize: "1.2rem",
            color: "text.secondary",
          }}
        >
          Este menú no tiene productos ni combos registrados.
        </Typography>
      )}

      {/* ELEMENTOS AGRUPADOS POR CATEGORÍA */}

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

          <Grid container spacing={3} alignItems="stretch">
            {items.map((item, index) => (
              <Grid
                key={`${
                  item.IdProducto
                    ? `producto-${item.IdProducto}`
                    : `combo-${item.IdCombo}`
                }-${index}`}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
                sx={{
                  display: "flex",
                }}
              >
                <Card
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

                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "1.25rem",
                      }}
                    >
                      {item.Nombre || item.NombreItem || "Sin nombre"}
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
                      {item.Descripcion || "Sin descripción"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: "auto",
                        pt: 2,
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Precio
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: "black",
                          fontSize: "1.3rem",
                        }}
                      >
                        ₡{formatearPrecio(item.Precio ?? item.PrecioEspecial)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
