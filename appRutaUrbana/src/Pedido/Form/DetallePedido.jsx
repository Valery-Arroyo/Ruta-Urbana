import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Box,
  Card,
  Typography,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  Chip,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import toast from "react-hot-toast";

import PedidoService from "../../services/PedidoService";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

export default function DetallePedidoFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { rol } = useAuth();
  const esGestor = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;

  const [pedido, setPedido] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estados, setEstados] = useState([]);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    PedidoService.getDetalle(id)
      .then((response) => {
        setPedido(response.data?.encabezado || null);
        setDetalle(response.data?.detalle || []);
      })
      .catch((error) => {
        console.error("Error al obtener el detalle del pedido:", error);
      })
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    if (!esGestor) return;

    PedidoService.getEstados()
      .then((response) => setEstados(response.data?.estados || []))
      .catch((error) => console.error("Error al obtener los estados:", error));
  }, [esGestor]);

  const handleCambiarEstado = async (event) => {
    const nuevoIdEstado = Number(event.target.value);

    try {
      setActualizandoEstado(true);
      await PedidoService.cambiarEstado(id, nuevoIdEstado);

      const nuevoEstado = estados.find(
        (e) => Number(e.IdEstado) === nuevoIdEstado,
      );

      setPedido((prev) => ({
        ...prev,
        IdEstado: nuevoIdEstado,
        NombreEstado: nuevoEstado?.Nombre || prev.NombreEstado,
      }));

      toast.success(t("orders.messages.statusUpdated"));
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      toast.error(t("orders.messages.statusUpdateError"));
    } finally {
      setActualizandoEstado(false);
    }
  };

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#FF8C00" }} />
      </Box>
    );
  }

  if (!pedido) {
    return (
      <Typography align="center" sx={{ py: 6 }}>
        {t("orders.notFound")}
      </Typography>
    );
  }

  const filaEncabezado = (etiqueta, valor) => (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        {etiqueta}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{valor || "—"}</Typography>
    </Grid>
  );

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 800,
          p: 4,
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
            mb: 3,
            color: "black",
            borderColor: "black",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": { borderColor: "black", backgroundColor: "#FFF3E0" },
          }}
        >
          {t("actions.back")}
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {t("orders.invoiceTitle")}
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              {pedido.CodigoOrden}
            </Typography>
          </Box>

          <Chip
            label={pedido.NombreEstado}
            sx={{ bgcolor: "#111", color: "#FF8C00", fontWeight: "bold" }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Encabezado del pedido */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {filaEncabezado(
            t("orders.date"),
            formatDateTime(pedido.FechaPedido, i18n.language),
          )}
          {filaEncabezado(
            t("orders.client"),
            pedido.NombreCliente
              ? `${pedido.NombreCliente} — ${pedido.CorreoCliente}`
              : t("orders.walkInClient"),
          )}
          {pedido.NombreEmpleado &&
            filaEncabezado(t("orders.manager"), pedido.NombreEmpleado)}
          {filaEncabezado(
            t("orders.deliveryMethod"),
            pedido.NombreMetodoEntrega,
          )}
          {filaEncabezado(
            t("orders.paymentMethod"),
            pedido.NombreMetodoPago || t("orders.paymentPending"),
          )}
          {esGestor ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {t("orders.status")}
              </Typography>

              <TextField
                select
                size="small"
                value={pedido.IdEstado || ""}
                onChange={handleCambiarEstado}
                disabled={actualizandoEstado || estados.length === 0}
                sx={{ mt: 0.5, minWidth: 220 }}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.IdEstado} value={estado.IdEstado}>
                    {estado.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ) : (
            filaEncabezado(t("orders.status"), pedido.NombreEstado)
          )}
          {pedido.DireccionEntrega &&
            filaEncabezado(
              t("orders.deliveryAddress"),
              pedido.DireccionEntrega,
            )}
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* Detalle de líneas */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("orders.item")}</TableCell>
              <TableCell align="right">{t("orders.unitPrice")}</TableCell>
              <TableCell align="right">{t("orders.quantity")}</TableCell>
              <TableCell align="right">{t("orders.subtotal")}</TableCell>
              <TableCell align="right">{t("orders.tax")}</TableCell>
              <TableCell>{t("orders.observations")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {detalle.map((linea) => (
              <TableRow key={linea.IdDetalle}>
                <TableCell>{linea.NombreItem}</TableCell>
                <TableCell align="right">
                  {formatCurrency(linea.PrecioUnitario, i18n.language)}
                </TableCell>
                <TableCell align="right">{linea.Cantidad}</TableCell>
                <TableCell align="right">
                  {formatCurrency(linea.Subtotal, i18n.language)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(linea.Impuesto, i18n.language)}
                </TableCell>
                <TableCell>{linea.Observaciones || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ ml: "auto", maxWidth: 320 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography>{t("orders.subtotalWithoutTax")}</Typography>
            <Typography>
              {formatCurrency(pedido.Subtotal, i18n.language)}
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography>{t("orders.tax")}</Typography>
            <Typography>
              {formatCurrency(pedido.Impuesto, i18n.language)}
            </Typography>
          </Box>

          {Number(pedido.CostoEnvio) > 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography>{t("orders.shippingCost")}</Typography>
              <Typography>
                {formatCurrency(pedido.CostoEnvio, i18n.language)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 800 }}>
              {t("orders.totalWithTax")}
            </Typography>
            <Typography
              sx={{ fontWeight: 800, color: "#FF8C00", fontSize: "1.2rem" }}
            >
              {formatCurrency(pedido.Total, i18n.language)}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
