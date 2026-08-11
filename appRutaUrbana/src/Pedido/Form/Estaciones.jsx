import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import PedidoService from "../../services/PedidoService";

export default function Estaciones() {
  const { t } = useTranslation();
  const { rol } = useAuth();
  const esGestor = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;

  const [lineas, setLineas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargarLineas = useCallback(async () => {
    setCargando(true);

    try {
      const response = await PedidoService.getEstaciones();
      setLineas(response.data?.lineas || []);
    } catch (error) {
      console.error("Error cargando las líneas por estación:", error);

      const mensaje =
        error.response?.data?.result ||
        `Error ${error.response?.status || ""}: no se pudieron cargar las estaciones`;

      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!esGestor) return;

    cargarLineas();
  }, [esGestor, cargarLineas]);

  const handleCambiarEstadoLinea = async (linea, completado) => {
    if (guardando) return;

    try {
      setGuardando(true);
      await PedidoService.cambiarEstadoLinea(linea.IdDetalle, completado);
      await cargarLineas();
    } catch (error) {
      console.error("Error actualizando la línea:", error);
      console.error("Respuesta cruda del servidor:", error.response?.data);

      const detalle =
        error.response?.data?.result ||
        (typeof error.response?.data === "string"
          ? error.response.data.slice(0, 300)
          : JSON.stringify(error.response?.data || {}).slice(0, 300));

      toast.error(
        `Error ${error.response?.status || ""}: ${detalle || "no se pudo actualizar la línea"}`,
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!esGestor) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>{t("orders.mustLogin")}</Typography>
      </Box>
    );
  }

  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: "#FF8C00" }} />
      </Box>
    );
  }

  // Se agrupan las líneas por estación para mostrarlas en columnas
  const grupos = lineas.reduce((acc, linea) => {
    const estacion = linea.NombreEstacion || t("stations.noStation");
    if (!acc[estacion]) acc[estacion] = [];
    acc[estacion].push(linea);
    return acc;
  }, {});

  const nombresEstaciones = Object.keys(grupos);

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
        {t("stations.title")}
      </Typography>

      <Typography align="center" sx={{ color: "text.secondary", mb: 4 }}>
        {t("stations.subtitle")}
      </Typography>

      {nombresEstaciones.length === 0 ? (
        <Typography align="center" sx={{ color: "text.secondary", py: 4 }}>
          {t("stations.noLines")}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-start" }}>
          {nombresEstaciones.map((estacion) => (
            <Box key={estacion} sx={{ width: 320 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  mb: 1.5,
                  color: "#FF8C00",
                  textTransform: "uppercase",
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
              >
                {estacion}
              </Typography>

              {grupos[estacion].map((linea) => (
                <Card
                  key={linea.IdDetalle}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,.10)",
                    opacity: Number(linea.Completado) === 1 ? 0.6 : 1,
                  }}
                >
                  <CardContent>
                    <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {linea.CodigoOrden}
                    </Typography>

                    <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 1 }}>
                      {linea.NombreCliente || t("orders.walkInClient")}
                    </Typography>

                    <Typography sx={{ fontWeight: 600 }}>
                      {linea.Cantidad} × {linea.NombreItem}
                    </Typography>

                    {linea.Observaciones && (
                      <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                        {linea.Observaciones}
                      </Typography>
                    )}

                    <Typography
                      component={Link}
                      to={`/pedidos/${linea.IdPedido}`}
                      sx={{ fontSize: 12, color: "#FF8C00", display: "block", mt: 0.5 }}
                    >
                      {t("stations.viewOrder")}
                    </Typography>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={Number(linea.Completado) === 1 ? 1 : 0}
                      disabled={guardando}
                      onChange={(event) =>
                        handleCambiarEstadoLinea(linea, Number(event.target.value))
                      }
                      sx={{ mt: 1.5 }}
                    >
                      <MenuItem value={0}>{t("stations.pending")}</MenuItem>
                      <MenuItem value={1}>{t("stations.done")}</MenuItem>
                    </TextField>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
