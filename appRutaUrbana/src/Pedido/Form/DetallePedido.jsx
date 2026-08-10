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
  Chip,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import PedidoService from "../../services/PedidoService";
import { formatCurrency, formatDateTime } from "../../utils/format";

export default function DetallePedidoFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [pedido, setPedido] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(true);

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
          {filaEncabezado(t("orders.status"), pedido.NombreEstado)}
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

        {/* Totales */}
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
