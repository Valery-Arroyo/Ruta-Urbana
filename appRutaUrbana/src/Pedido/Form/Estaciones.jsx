import { useCallback, useEffect, useMemo, useState } from "react";
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
  Chip,
  Stack,
  Button,
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import PedidoService from "../../services/PedidoService";

export default function Estaciones() {
  const { t } = useTranslation();
  const { rol } = useAuth();
  const esCocina = rol === ROLES.COCINA;

  const [lineas, setLineas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [filtroPedido, setFiltroPedido] = useState("todos");
  const [estacionActiva, setEstacionActiva] = useState("todas");

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
    if (!esCocina) return;

    cargarLineas();
  }, [esCocina, cargarLineas]);

  const handleCambiarEstadoLinea = async (linea, completado) => {
    if (guardando) return;

    let seCompletaElPedido = false;

    if (completado === 1) {
      const lineasDelPedido = new Map();

      lineas.forEach((l) => {
        if (l.IdPedido === linea.IdPedido) {
          const key = `${l.IdDetalle}-${l.NombreEstacion || "sin-estacion"}`;
          lineasDelPedido.set(key, Number(l.Completado) === 1);
        }
      });

      const keyActual = `${linea.IdDetalle}-${linea.NombreEstacion || "sin-estacion"}`;
      lineasDelPedido.set(keyActual, true);

      seCompletaElPedido = Array.from(lineasDelPedido.values()).every(Boolean);
    }

    try {
      setGuardando(true);
      await PedidoService.cambiarEstadoLinea(linea.IdDetalle, linea.IdEstacion, completado);
      await cargarLineas();

      if (seCompletaElPedido) {
        toast.success(`${t("stations.orderFinished")} — ${linea.CodigoOrden}`);
      }
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

  // Pedidos que tienen líneas pendientes en este momento, para el filtro.
  const pedidosDisponibles = useMemo(() => {
    const mapa = new Map();

    lineas.forEach((linea) => {
      if (!mapa.has(linea.IdPedido)) {
        mapa.set(linea.IdPedido, linea.CodigoOrden);
      }
    });

    return Array.from(mapa, ([IdPedido, CodigoOrden]) => ({ IdPedido, CodigoOrden }));
  }, [lineas]);

  const lineasDelPedido = useMemo(() => {
    if (filtroPedido === "todos") return lineas;

    return lineas.filter((linea) => String(linea.IdPedido) === String(filtroPedido));
  }, [lineas, filtroPedido]);

  const nombresEstacionesDisponibles = useMemo(() => {
    const set = new Set(
      lineasDelPedido.map((linea) => linea.NombreEstacion || t("stations.noStation")),
    );

    return Array.from(set);
  }, [lineasDelPedido, t]);

  const lineasVisibles = useMemo(() => {
    if (estacionActiva === "todas") return lineasDelPedido;

    return lineasDelPedido.filter(
      (linea) => (linea.NombreEstacion || t("stations.noStation")) === estacionActiva,
    );
  }, [lineasDelPedido, estacionActiva, t]);

  const cambiarPedido = (idPedido) => {
    setFiltroPedido(idPedido);
    setEstacionActiva("todas");
  };

  if (!esCocina) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>{t("stations.onlyKitchen")}</Typography>
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

  const pendientes = lineasVisibles.filter((linea) => Number(linea.Completado) !== 1);
  const finalizados = lineasVisibles.filter((linea) => Number(linea.Completado) === 1);

  const tarjeta = (linea) => (
    <Card
      key={`${linea.IdDetalle}-${linea.NombreEstacion || "sin-estacion"}`}
      sx={{
        mb: 2.5,
        borderRadius: 3,
        boxShadow: "0 4px 14px rgba(0,0,0,.10)",
        opacity: Number(linea.Completado) === 1 ? 0.8 : 1,
        borderLeft: Number(linea.Completado) === 1 ? "5px solid #2E7D32" : "5px solid #FF8C00",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {estacionActiva === "todas" && (
          <Chip
            label={linea.NombreEstacion || t("stations.noStation")}
            size="small"
            sx={{
              mb: 1.5,
              bgcolor: "#FFF3E0",
              color: "#B25900",
              fontWeight: "bold",
            }}
          />
        )}

        <Typography sx={{ fontWeight: "bold", mb: 0.5, fontSize: 16 }}>
          {linea.CodigoOrden}
        </Typography>

        <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 1.5 }}>
          {linea.NombreCliente || t("orders.walkInClient")}
        </Typography>

        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
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
          sx={{ fontSize: 12, color: "#FF8C00", display: "block", mt: 1 }}
        >
          {t("stations.viewOrder")}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
          <Button
            fullWidth
            size="large"
            variant={Number(linea.Completado) !== 1 ? "contained" : "outlined"}
            disabled={guardando}
            onClick={() => handleCambiarEstadoLinea(linea, 0)}
            sx={{
              py: 1.6,
              fontSize: 15,
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2,
              borderWidth: 2,
              bgcolor: Number(linea.Completado) !== 1 ? "#FF8C00" : "transparent",
              borderColor: "#FF8C00",
              color: Number(linea.Completado) !== 1 ? "#fff" : "#FF8C00",
              "&:hover": {
                bgcolor: Number(linea.Completado) !== 1 ? "#E67E00" : "rgba(255,140,0,.08)",
                borderColor: "#FF8C00",
                borderWidth: 2,
              },
            }}
          >
            {t("stations.pending")}
          </Button>

          <Button
            fullWidth
            size="large"
            variant={Number(linea.Completado) === 1 ? "contained" : "outlined"}
            color="success"
            disabled={guardando}
            onClick={() => handleCambiarEstadoLinea(linea, 1)}
            sx={{
              py: 1.6,
              fontSize: 15,
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2,
              borderWidth: 2,
              "&:hover": { borderWidth: 2 },
            }}
          >
            {t("stations.done")}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const columna = (titulo, color, colorFondo, items) => (
    <Box
      sx={{
        flex: "1 1 460px",
        maxWidth: 560,
        minWidth: 320,
        bgcolor: colorFondo,
        borderRadius: 4,
        p: 3,
      }}
    >
      <Typography
        sx={{
          fontWeight: "bold",
          mb: 2.5,
          color,
          textTransform: "uppercase",
          fontSize: 16,
          letterSpacing: 0.5,
        }}
      >
        {titulo} ({items.length})
      </Typography>

      {items.length === 0 ? (
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          {t("stations.emptyColumn")}
        </Typography>
      ) : (
        items.map((linea) => tarjeta(linea))
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 4, maxWidth: 1500, mx: "auto" }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
        {t("stations.title")}
      </Typography>

      <Typography align="center" sx={{ color: "text.secondary", mb: 4 }}>
        {t("stations.subtitle")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
          alignItems: "center",
          gap: 2,
          mb: 5,
        }}
      >
        {/* Celda vacía a la izquierda: balancea el ancho del filtro de la
            derecha para que los chips del centro queden centrados de verdad. */}
        <Box sx={{ display: { xs: "none", md: "block" } }} />

        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          gap={3}
          sx={{ justifySelf: "center" }}
        >
          <Chip
            label={t("stations.allStations")}
            clickable
            onClick={() => setEstacionActiva("todas")}
            color={estacionActiva === "todas" ? "warning" : "default"}
            sx={{ fontWeight: "bold", fontSize: 16, px: 2, py: 3.2, borderRadius: 5 }}
          />

          {nombresEstacionesDisponibles.map((estacion) => (
            <Chip
              key={estacion}
              label={estacion}
              clickable
              onClick={() => setEstacionActiva(estacion)}
              color={estacionActiva === estacion ? "warning" : "default"}
              sx={{ fontWeight: "bold", fontSize: 16, px: 2, py: 3.2, borderRadius: 5 }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
            justifySelf: { md: "end" },
          }}
        >
          <TextField
            select
            size="small"
            label={t("stations.filterByOrder")}
            value={filtroPedido}
            onChange={(event) => cambiarPedido(event.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="todos">{t("stations.allOrders")}</MenuItem>
            {pedidosDisponibles.map((pedido) => (
              <MenuItem key={pedido.IdPedido} value={pedido.IdPedido}>
                {pedido.CodigoOrden}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {lineasVisibles.length === 0 ? (
        <Typography align="center" sx={{ color: "text.secondary", py: 4 }}>
          {t("stations.noLines")}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {columna(t("stations.pendingColumn"), "#B25900", "#FFF3E0", pendientes)}
          {columna(t("stations.doneColumn"), "#1B5E20", "#EAF6EC", finalizados)}
        </Box>
      )}
    </Box>
  );
}
