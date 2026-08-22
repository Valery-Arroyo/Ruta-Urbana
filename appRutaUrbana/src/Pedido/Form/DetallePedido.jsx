import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
import GridOnIcon from "@mui/icons-material/GridOn";

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
  const esCliente = rol === ROLES.CLIENTE;

  const [pedido, setPedido] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estados, setEstados] = useState([]);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const [tipoCambio, setTipoCambio] = useState(null);

  useEffect(() => {
    PedidoService.getTipoCambio()
      .then((response) => setTipoCambio(response.data?.tipoCambio || null))
      .catch((error) =>
        console.error("Error obteniendo el tipo de cambio", error),
      );
  }, []);

  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }

    const cargarDetalle = async (mostrarCarga = true) => {
      try {
        if (mostrarCarga) {
          setCargando(true);
        }

        const response = await PedidoService.getDetalle(id);
        setPedido(response.data?.encabezado || null);
        setDetalle(response.data?.detalle || []);
      } catch (error) {
        console.error("Error al obtener el detalle del pedido:", error);
      } finally {
        if (mostrarCarga) {
          setCargando(false);
        }
      }
    };

    cargarDetalle(true);

    if (esCliente) {
      const intervalo = setInterval(() => {
        cargarDetalle(false);
      }, 5000);

      return () => clearInterval(intervalo);
    }
  }, [id, esCliente]);

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

  // Función para formatear valores monetarios en el PDF
  const formatCurrencyPdf = (valor) => {
    const numero = Number(valor) || 0;
    return `CRC ${numero.toLocaleString("es-CR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const generarFacturaPDF = () => {
    if (!pedido) return;

    try {
      const doc = new jsPDF();

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
      doc.text(
        `${t("orders.deliveryMethod")}: ${pedido.NombreMetodoEntrega || ""}`,
        14,
        y,
      );
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
        doc.text(
          `${t("orders.deliveryAddress")}: ${pedido.DireccionEntrega}`,
          14,
          y,
        );
        y += 6;
      }

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
      filaTotal(
        t("orders.subtotalWithoutTax"),
        formatCurrencyPdf(pedido.Subtotal),
      );
      filaTotal(t("orders.tax"), formatCurrencyPdf(pedido.Impuesto));

      if (Number(pedido.CostoEnvio) > 0) {
        filaTotal(
          t("orders.shippingCost"),
          formatCurrencyPdf(pedido.CostoEnvio),
        );
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

  // Exporta la factura del pedido a Excel con formato: encabezado del
  // pedido, tabla de líneas con colores de marca y bordes, y totales
  const generarFacturaExcel = async () => {
    if (!pedido) return;

    try {
      const NARANJA = "FFFF8C00";
      const NEGRO = "FF111111";
      const BLANCO = "FFFFFFFF";
      const FRANJA = "FFFFF3E0";

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Ruta Urbana";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Factura");
      sheet.columns = [
        { width: 30 },
        { width: 16 },
        { width: 12 },
        { width: 16 },
        { width: 14 },
        { width: 28 },
      ];

      // --- Título ---
      sheet.mergeCells("A1:F1");
      const tituloCelda = sheet.getCell("A1");
      tituloCelda.value = t("orders.invoiceTitle");
      tituloCelda.font = { bold: true, size: 16, color: { argb: NEGRO } };
      tituloCelda.alignment = { vertical: "middle" };
      sheet.getRow(1).height = 28;

      // --- Encabezado del pedido (etiqueta en negrita + valor) ---
      let fila = 3;
      const filaInfo = (etiqueta, valor) => {
        const etiquetaCelda = sheet.getCell(`A${fila}`);
        etiquetaCelda.value = etiqueta;
        etiquetaCelda.font = { bold: true };

        sheet.mergeCells(`B${fila}:F${fila}`);
        sheet.getCell(`B${fila}`).value = valor ?? "";

        fila += 1;
      };

      filaInfo("Orden", pedido.CodigoOrden || "");
      filaInfo(
        t("orders.date"),
        formatDateTime(pedido.FechaPedido, i18n.language),
      );
      filaInfo(
        t("orders.client"),
        pedido.NombreCliente
          ? `${pedido.NombreCliente} - ${pedido.CorreoCliente}`
          : t("orders.walkInClient"),
      );
      if (pedido.NombreEmpleado) {
        filaInfo(t("orders.manager"), pedido.NombreEmpleado);
      }
      filaInfo(t("orders.deliveryMethod"), pedido.NombreMetodoEntrega);
      filaInfo(
        t("orders.paymentMethod"),
        pedido.NombreMetodoPago || t("orders.paymentPending"),
      );
      filaInfo(t("orders.status"), pedido.NombreEstado);
      if (pedido.DireccionEntrega) {
        filaInfo(t("orders.deliveryAddress"), pedido.DireccionEntrega);
      }

      fila += 1; // fila en blanco antes de la tabla

      // --- Encabezado de la tabla de líneas ---
      const bordeFino = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      const filaEncabezadoTabla = fila;
      const columnas = [
        t("orders.item"),
        t("orders.unitPrice"),
        t("orders.quantity"),
        t("orders.subtotal"),
        t("orders.tax"),
        t("orders.observations"),
      ];

      columnas.forEach((texto, i) => {
        const celda = sheet.getCell(filaEncabezadoTabla, i + 1);
        celda.value = texto;
        celda.font = { bold: true, color: { argb: BLANCO } };
        celda.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: NARANJA },
        };
        celda.alignment = { horizontal: "center", vertical: "middle" };
        celda.border = bordeFino;
      });
      sheet.getRow(filaEncabezadoTabla).height = 20;

      // --- Filas de detalle ---
      fila += 1;
      detalle.forEach((linea, idx) => {
        const filaActual = fila + idx;
        const valores = [
          linea.NombreItem,
          Number(linea.PrecioUnitario) || 0,
          linea.Cantidad,
          Number(linea.Subtotal) || 0,
          Number(linea.Impuesto) || 0,
          linea.Observaciones || "",
        ];

        valores.forEach((valor, i) => {
          const celda = sheet.getCell(filaActual, i + 1);
          celda.value = valor;
          celda.border = bordeFino;

          if (idx % 2 === 1) {
            celda.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: FRANJA },
            };
          }
          if (i === 1 || i === 3 || i === 4) {
            celda.numFmt = "#,##0";
            celda.alignment = { horizontal: "right" };
          } else if (i === 2) {
            celda.alignment = { horizontal: "center" };
          }
        });
      });

      fila += detalle.length + 1; // fila en blanco antes de los totales

      // --- Totales ---
      const filaTotal = (etiqueta, valor, destacado = false) => {
        const etiquetaCelda = sheet.getCell(`D${fila}`);
        etiquetaCelda.value = etiqueta;
        etiquetaCelda.font = { bold: destacado };
        etiquetaCelda.alignment = { horizontal: "right" };

        const valorCelda = sheet.getCell(`F${fila}`);
        valorCelda.value = Number(valor) || 0;
        valorCelda.numFmt = "#,##0";
        valorCelda.alignment = { horizontal: "right" };
        valorCelda.font = destacado
          ? { bold: true, color: { argb: NARANJA }, size: 12 }
          : {};

        fila += 1;
      };

      filaTotal(t("orders.subtotalWithoutTax"), pedido.Subtotal);
      filaTotal(t("orders.tax"), pedido.Impuesto);
      if (Number(pedido.CostoEnvio) > 0) {
        filaTotal(t("orders.shippingCost"), pedido.CostoEnvio);
      }
      filaTotal(t("orders.totalWithTax"), pedido.Total, true);

      // --- Guardar el archivo ---
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `factura_${pedido.CodigoOrden || id}.xlsx`);
    } catch (error) {
      console.error("Error al generar la factura en Excel:", error);
      toast.error(
        t("orders.messages.excelError") || "No se pudo generar el Excel",
      );
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

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={generarFacturaPDF}
              sx={{
                bgcolor: "#111",
                color: "#FF8C00",
                fontWeight: "bold",
                textTransform: "none",
                minWidth: 190,
                "&:hover": { bgcolor: "#333" },
              }}
            >
              Imprimir Factura
            </Button>

            <Button
              variant="contained"
              startIcon={<GridOnIcon />}
              onClick={generarFacturaExcel}
              sx={{
                bgcolor: "#111",
                color: "#FF8C00",
                fontWeight: "bold",
                textTransform: "none",
                minWidth: 190,
                "&:hover": { bgcolor: "#333" },
              }}
            >
              Exportar a Excel
            </Button>
          </Box>
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

        {esCliente && (
          <>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                Seguimiento del pedido
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  width: "100%",
                  overflowX: "auto",
                  pb: 1,
                }}
              >
                {[
                  { id: 1, nombre: "Pendiente de pago" },
                  { id: 2, nombre: "Aceptada" },
                  { id: 3, nombre: "Preparación" },
                  { id: 4, nombre: "Procesando" },
                  { id: 5, nombre: "Entregada" },
                ].map((estado, index, lista) => {
                  const idEstadoActual = Number(pedido.IdEstado);
                  const completado = idEstadoActual > estado.id;
                  const actual = idEstadoActual === estado.id;

                  return (
                    <Box
                      key={estado.id}
                      sx={{
                        flex: 1,
                        minWidth: 120,
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                          zIndex: 2,
                          minWidth: 105,
                        }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor:
                              completado || actual ? "#FF8C00" : "#E0E0E0",
                            color: completado || actual ? "#FFFFFF" : "#777777",
                            border: actual
                              ? "3px solid #111"
                              : "3px solid transparent",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {completado ? "✓" : estado.id}
                        </Box>

                        <Typography
                          variant="caption"
                          align="center"
                          sx={{
                            mt: 1,
                            px: 0.5,
                            fontWeight: actual ? 800 : completado ? 600 : 400,
                            color: actual
                              ? "#FF8C00"
                              : completado
                                ? "text.primary"
                                : "text.secondary",
                          }}
                        >
                          {estado.nombre}
                        </Typography>

                        {actual && (
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 0.5,
                              color: "#FF8C00",
                              fontWeight: 700,
                              fontSize: 10,
                            }}
                          >
                            Estado actual
                          </Typography>
                        )}
                      </Box>

                      {index < lista.length - 1 && (
                        <Box
                          sx={{
                            flex: 1,
                            height: 4,
                            mt: "15px",
                            mx: -1,
                            bgcolor:
                              idEstadoActual > estado.id
                                ? "#FF8C00"
                                : "#E0E0E0",
                            transition: "background-color 0.3s ease",
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </>
        )}

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
              sx={{
                textAlign: "right",
                color: "text.secondary",
                fontSize: 13,
                mt: 0.3,
              }}
            >
              ≈ ${(Number(pedido.Total) / tipoCambio).toFixed(2)} USD
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}
