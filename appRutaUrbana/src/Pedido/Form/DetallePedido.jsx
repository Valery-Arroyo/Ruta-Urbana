import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import PedidoService from "../../services/PedidoService";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

export default function DetallePedidoFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { rol } = useAuth();
  const esCocina = rol === ROLES.COCINA;

  const [pedido, setPedido] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estados, setEstados] = useState([]);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  // Tipo de cambio USD -> CRC, obtenido de un Web Service externo
  // (frankfurter.app), solo para mostrar el total también en dólares.
  const [tipoCambio, setTipoCambio] = useState(null);

  useEffect(() => {
    PedidoService.getTipoCambio()
      .then((response) => setTipoCambio(response.data?.tipoCambio || null))
      .catch((error) =>
        console.error("Error obteniendo el tipo de cambio", error),
      );
  }, []);

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

  // Solo Cocina edita el estado general a mano; para los demás roles
  // avanza solo desde la pantalla de Estaciones.
  useEffect(() => {
    if (!esCocina) return;

    PedidoService.getEstados()
      .then((response) => setEstados(response.data?.estados || []))
      .catch((error) => console.error("Error al obtener los estados:", error));
  }, [esCocina]);

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

  // jsPDF con la fuente estándar (Helvetica) no soporta el símbolo ₡ que
  // devuelve formatCurrency (Intl.NumberFormat) — usarlo rompe el cálculo
  // de columnas de autoTable y deja la tabla en blanco. Por eso, solo para
  // el PDF, formateamos el monto sin ese símbolo.
  const formatCurrencyPdf = (valor) => {
    const numero = Number(valor) || 0;
    return `CRC ${numero.toLocaleString("es-CR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Genera la factura del pedido en PDF, siguiendo el mismo patrón de
  // jsPDF + jspdf-autotable usado para "Generar Reporte" (Investigación
  // "Reportes con PDF"), pero adaptado a una sola factura en vez de un
  // listado general de productos.
  const generarFacturaPDF = () => {
    if (!pedido) return;

    try {
      const doc = new jsPDF();

    // --- Encabezado de la factura ---
    doc.setFontSize(16);
    doc.text(t("orders.invoiceTitle"), 14, 18);

    doc.setFontSize(10);
    doc.text(`Orden: ${pedido.CodigoOrden || ""}`, 14, 26);
    doc.text(
      `${t("orders.date")}: ${formatDateTime(pedido.FechaPedido, i18n.language)}`,
      14,
      32,
    );
    doc.text(
      `${t("orders.client")}: ${
        pedido.NombreCliente
          ? `${pedido.NombreCliente} - ${pedido.CorreoCliente}`
          : t("orders.walkInClient")
      }`,
      14,
      38,
    );

    let y = 44;
    if (pedido.NombreEmpleado) {
      doc.text(`${t("orders.manager")}: ${pedido.NombreEmpleado}`, 14, y);
      y += 6;
    }
    doc.text(`${t("orders.deliveryMethod")}: ${pedido.NombreMetodoEntrega || ""}`, 14, y);
    y += 6;
    doc.text(
      `${t("orders.paymentMethod")}: ${
        pedido.NombreMetodoPago || t("orders.paymentPending")
      }`,
      14,
      y,
    );
    y += 6;
    doc.text(`${t("orders.status")}: ${pedido.NombreEstado || ""}`, 14, y);
    y += 6;
    if (pedido.DireccionEntrega) {
      doc.text(`${t("orders.deliveryAddress")}: ${pedido.DireccionEntrega}`, 14, y);
      y += 6;
    }

    // --- Tabla con el detalle de líneas del pedido ---
    const columnas = [
      t("orders.item"),
      t("orders.unitPrice"),
      t("orders.quantity"),
      t("orders.subtotal"),
      t("orders.tax"),
      t("orders.observations"),
    ];

    const filas = detalle.map((linea) => [
      linea.NombreItem,
      formatCurrencyPdf(linea.PrecioUnitario),
      linea.Cantidad,
      formatCurrencyPdf(linea.Subtotal),
      formatCurrencyPdf(linea.Impuesto),
      linea.Observaciones || "-",
    ]);

    // TEMPORAL: para diagnosticar por qué la tabla sale vacía.
    // Revisá la consola del navegador (F12) después de generar el PDF
    // y compartime lo que imprime aquí.
    console.log("DEBUG detalle:", detalle);
    console.log("DEBUG filas:", filas);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: y + 4,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 140, 0] }, // #FF8C00
    });

    // --- Totales, debajo de la tabla ---
    let totalesY = doc.lastAutoTable.finalY + 8;

    const filaTotal = (etiqueta, valor) => {
      doc.text(etiqueta, 150, totalesY, { align: "right" });
      doc.text(String(valor), 196, totalesY, { align: "right" });
      totalesY += 7;
    };

    doc.setFontSize(10);
    filaTotal(t("orders.subtotalWithoutTax"), formatCurrencyPdf(pedido.Subtotal));
    filaTotal(t("orders.tax"), formatCurrencyPdf(pedido.Impuesto));

    if (Number(pedido.CostoEnvio) > 0) {
      filaTotal(t("orders.shippingCost"), formatCurrencyPdf(pedido.CostoEnvio));
    }

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    filaTotal(t("orders.totalWithTax"), formatCurrencyPdf(pedido.Total));
    doc.setFont(undefined, "normal");

    if (tipoCambio) {
      doc.setFontSize(9);
      doc.text(
        `~ $${(Number(pedido.Total) / tipoCambio).toFixed(2)} USD`,
        196,
        totalesY,
        { align: "right" },
      );
    }

    doc.save(`factura_${pedido.CodigoOrden || id}.pdf`);
    } catch (error) {
      console.error("Error al generar la factura en PDF:", error);
      toast.error(t("orders.messages.pdfError") || "No se pudo generar el PDF");
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              color: "black",
              borderColor: "black",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { borderColor: "black", backgroundColor: "#FFF3E0" },
            }}
          >
            {t("actions.back")}
          </Button>

          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={generarFacturaPDF}
            sx={{
              bgcolor: "#111",
              color: "#FF8C00",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { bgcolor: "#333" },
            }}
          >
            Imprimir Factura
          </Button>
        </Box>

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
          {esCocina ? (
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

          {tipoCambio && (
            <Typography
              sx={{ textAlign: "right", color: "text.secondary", fontSize: 13, mt: 0.3 }}
            >
              ≈ ${(Number(pedido.Total) / tipoCambio).toFixed(2)} USD
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}