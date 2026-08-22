import { useEffect, useState, useCallback } from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";

import { useAuth } from "../../context/AuthContext";

import PedidoService from "../../services/PedidoService";

import { formatCurrency, formatDateTime } from "../../utils/format";

import { ROLES } from "../../utils/constants";

const colorPorEstado = {
  1: "warning", // Pendiente de pago
  2: "info", // Aceptada
  3: "secondary", // Preparación
  4: "primary", // Procesando
  5: "success", // Entregada
};

export default function HistorialPedidos() {
  const { t, i18n } = useTranslation();

  const { usuario, rol, isAuthenticated } = useAuth();

  // Administrador, Encargado y Cocina ven el historial completo de
  // pedidos (con filtros y columna de cliente); el Cliente solo ve los
  // suyos. Cocina nunca registra pedidos, solo los consulta y los
  // trabaja desde Estaciones.
  const esGestor =
    rol === ROLES.ADMINISTRADOR ||
    rol === ROLES.ENCARGADO ||
    rol === ROLES.COCINA;

  const [pedidos, setPedidos] = useState([]);

  const [estados, setEstados] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [filtroFecha, setFiltroFecha] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("");

  const cargarPedidos = useCallback(
    async (mostrarCarga = true) => {
      if (mostrarCarga) {
        setCargando(true);
      }

      try {
        if (esGestor) {
          const response = await PedidoService.getHistorialTodos(
            filtroFecha,
            filtroEstado,
          );

          setPedidos(response.data?.pedidos || []);
        } else {
          const response = await PedidoService.getHistorialCliente();

          setPedidos(response.data?.pedidos || []);
        }
      } catch (error) {
        console.error("Error cargando historial de pedidos", error);
      } finally {
        if (mostrarCarga) {
          setCargando(false);
        }
      }
    },
    [esGestor, filtroFecha, filtroEstado],
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    // Primera consulta mostrando el indicador de carga
    cargarPedidos(true);

    // Si es Cliente, actualizar automáticamente cada 5 segundos
    if (!esGestor) {
      const intervalo = setInterval(() => {
        // Actualización silenciosa para no mostrar el CircularProgress
        cargarPedidos(false);
      }, 5000);

      // Detener el intervalo cuando el usuario salga de esta pantalla
      return () => clearInterval(intervalo);
    }
  }, [isAuthenticated, esGestor, cargarPedidos]);

  useEffect(() => {
    if (!esGestor) return;

    PedidoService.getEstados()
      .then((response) => setEstados(response.data?.estados || []))
      .catch((error) =>
        console.error("Error cargando estados", error),
      );
  }, [esGestor]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ mb: 2 }}>
          {t("orders.mustLogin")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: "bold", mb: 1 }}
      >
        {t("orders.historyTitle")}
      </Typography>

      <Typography
        align="center"
        sx={{ color: "text.secondary", mb: 4 }}
      >
        {esGestor
          ? t("orders.historySubtitleManager")
          : t("orders.historySubtitleClient", {
              nombre: usuario?.NombreCompleto,
            })}
      </Typography>

      {esGestor && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label={t("orders.filterByDate")}
            type="date"
            size="small"
            value={filtroFecha}
            onChange={(event) =>
              setFiltroFecha(event.target.value)
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{ minWidth: 200 }}
          />

          <TextField
            select
            label={t("orders.filterByStatus")}
            size="small"
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(event.target.value)
            }
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">
              {t("orders.allStatuses")}
            </MenuItem>

            {estados.map((estado) => (
              <MenuItem
                key={estado.IdEstado}
                value={estado.IdEstado}
              >
                {estado.Nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {cargando ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress sx={{ color: "#FF8C00" }} />
        </Box>
      ) : pedidos.length === 0 ? (
        <Typography
          align="center"
          sx={{
            color: "text.secondary",
            py: 4,
          }}
        >
          {t("orders.noOrders")}
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {t("orders.code")}
              </TableCell>

              <TableCell>
                {t("orders.date")}
              </TableCell>

              {esGestor && (
                <TableCell>
                  {t("orders.client")}
                </TableCell>
              )}

              <TableCell>
                {t("orders.deliveryMethod")}
              </TableCell>

              <TableCell>
                {t("orders.status")}
              </TableCell>

              <TableCell align="right">
                {t("orders.total")}
              </TableCell>

              <TableCell align="center">
                {t("orders.detail")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow
                key={pedido.IdPedido}
                hover
              >
                <TableCell>
                  {pedido.CodigoOrden}
                </TableCell>

                <TableCell>
                  {formatDateTime(
                    pedido.FechaPedido,
                    i18n.language,
                  )}
                </TableCell>

                {esGestor && (
                  <TableCell>
                    {pedido.NombreCliente ||
                      t("orders.walkInClient")}
                  </TableCell>
                )}

                <TableCell>
                  {pedido.NombreMetodoEntrega}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={pedido.NombreEstado}
                    color={
                      colorPorEstado[pedido.IdEstado] ||
                      "default"
                    }
                  />
                </TableCell>

                <TableCell align="right">
                  {formatCurrency(
                    pedido.Total,
                    i18n.language,
                  )}
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    component={Link}
                    to={`/pedidos/${pedido.IdPedido}`}
                    sx={{ color: "#FF8C00" }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}