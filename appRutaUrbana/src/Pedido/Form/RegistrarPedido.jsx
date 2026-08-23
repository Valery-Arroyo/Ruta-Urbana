import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import {
  Box,
  Card,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";

import { useAuth } from "../../context/AuthContext";
import { usePedidoEnCurso } from "../../context/PedidoEnCursoContext";
import ProductoService from "../../services/ProductoService";
import ComboService from "../../services/ComboService";
import AuthService from "../../services/AuthService";
import PedidoService from "../../services/PedidoService";
import LineaPedidoRow from "./LineaPedidoRow";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { ROLES, SHIPPING_COST } from "../../utils/constants";

const headerSchema = yup.object().shape({
  IdCliente: yup.string().notRequired(),
  IdMetodoEntrega: yup.string().required("Seleccione un método de entrega"),
  DireccionEntrega: yup.string().notRequired(),
});

export default function RegistrarPedido() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { usuario, rol } = useAuth();

  const esGestor = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;
  const esCocina = rol === ROLES.COCINA;
  const esAdministrador = rol === ROLES.ADMINISTRADOR;

  const {
    lineas,
    subtotal,
    impuesto,
    cantidadTotal,
    agregarLinea,
    actualizarCantidad,
    actualizarObservaciones,
    eliminarLinea,
    limpiarPedido,
  } = usePedidoEnCurso();

  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [metodosEntrega, setMetodosEntrega] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);

  const [tipoCambio, setTipoCambio] = useState(null);

  const [itemSeleccionado, setItemSeleccionado] = useState("");
  const [cantidadNueva, setCantidadNueva] = useState("1");

  const [datosEncabezado, setDatosEncabezado] = useState(null);
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [tipoPago, setTipoPago] = useState("efectivo");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [nombreTarjeta, setNombreTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [montoEfectivo, setMontoEfectivo] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(headerSchema),
    defaultValues: { IdCliente: "", IdMetodoEntrega: "", DireccionEntrega: "" },
  });

  const idClienteSeleccionado = watch("IdCliente");
  const idMetodoEntregaSeleccionado = watch("IdMetodoEntrega");

  useEffect(() => {
    ProductoService.getProductos()
      .then((response) => setProductos(response.data || []))
      .catch((error) => console.error("Error cargando productos", error));

    ComboService.getCombos()
      .then((response) => {
        const combosUnicos = [];
        const idsVistos = new Set();

        (response.data || []).forEach((fila) => {
          if (!idsVistos.has(fila.IdCombo)) {
            idsVistos.add(fila.IdCombo);
            combosUnicos.push(fila);
          }
        });

        setCombos(combosUnicos);
      })
      .catch((error) => console.error("Error cargando combos", error));

    PedidoService.getMetodosEntrega()
      .then((response) =>
        setMetodosEntrega(response.data?.metodosEntrega || []),
      )
      .catch((error) =>
        console.error("Error cargando métodos de entrega", error),
      );

    PedidoService.getMetodosPago()
      .then((response) => setMetodosPago(response.data?.metodosPago || []))
      .catch((error) => console.error("Error cargando métodos de pago", error));

    if (esGestor) {
      AuthService.getClientes()
        .then((response) => setClientes(response.data?.clientes || []))
        .catch((error) => console.error("Error cargando clientes", error));
    }

    PedidoService.getTipoCambio()
      .then((response) => setTipoCambio(response.data?.tipoCambio || null))
      .catch((error) =>
        console.error("Error obteniendo el tipo de cambio", error),
      );
  }, [esGestor]);

  const itemsDisponibles = useMemo(() => {
    const listaProductos = productos.map((p) => ({
      tipo: "Producto",
      idItem: p.IdProducto,
      nombre: p.Nombre,
      precio: Number(p.Precio),
    }));

    const listaCombos = combos.map((c) => ({
      tipo: "Combo",
      idItem: c.IdCombo,
      nombre: c.NombreCombo,
      precio: Number(c.PrecioEspecial),
    }));

    return [...listaProductos, ...listaCombos];
  }, [productos, combos]);

  const itemElegido = useMemo(
    () =>
      itemsDisponibles.find(
        (item) => `${item.tipo}:${item.idItem}` === itemSeleccionado,
      ),
    [itemsDisponibles, itemSeleccionado],
  );

  const clienteElegido = useMemo(
    () =>
      clientes.find(
        (c) => String(c.IdUsuario) === String(idClienteSeleccionado),
      ),
    [clientes, idClienteSeleccionado],
  );

  const metodoEntregaElegido = useMemo(
    () =>
      metodosEntrega.find(
        (m) =>
          String(m.IdMetodoEntrega) === String(idMetodoEntregaSeleccionado),
      ),
    [metodosEntrega, idMetodoEntregaSeleccionado],
  );

  const esDomicilio =
    !!metodoEntregaElegido &&
    /domicilio/i.test(metodoEntregaElegido.Descripcion);
  const costoEnvio = esDomicilio ? SHIPPING_COST : 0;
  const total = subtotal + impuesto + costoEnvio;
  const totalUsd = tipoCambio ? total / tipoCambio : null;

  useEffect(() => {
    if (esGestor && clienteElegido && esDomicilio) {
      setValue("DireccionEntrega", clienteElegido.Direccion || "");
    }
  }, [esGestor, clienteElegido, esDomicilio, setValue]);

  useEffect(() => {
    if (!esGestor && usuario?.Direccion && esDomicilio) {
      setValue("DireccionEntrega", usuario.Direccion);
    }
  }, [esGestor, usuario, esDomicilio, setValue]);

  const manejarAgregarLinea = () => {
    if (!itemElegido) {
      toast.error(t("orders.messages.selectItem"));
      return;
    }

    const cantidad = parseInt(cantidadNueva, 10);

    if (!cantidad || cantidad < 1) {
      toast.error(t("orders.messages.invalidQuantity"));
      return;
    }

    agregarLinea({
      tipo: itemElegido.tipo,
      idItem: itemElegido.idItem,
      nombre: itemElegido.nombre,
      precioUnitario: itemElegido.precio,
      cantidad,
    });

    setItemSeleccionado("");
    setCantidadNueva("1");
  };

  const onSubmitEncabezado = (data) => {
    if (esGestor && !data.IdCliente) {
      toast.error(t("orders.messages.selectClient"));
      return;
    }

    if (esDomicilio && !data.DireccionEntrega?.trim()) {
      toast.error(t("orders.messages.addressRequired"));
      return;
    }

    if (lineas.length === 0) {
      toast.error(t("orders.messages.noLines"));
      return;
    }

    setDatosEncabezado(data);
    setDialogoPagoAbierto(true);
  };

  const vuelto = useMemo(() => {
    const monto = parseFloat(montoEfectivo) || 0;
    return monto > total ? Number((monto - total).toFixed(2)) : 0;
  }, [montoEfectivo, total]);

  const cerrarDialogoPago = () => {
    setDialogoPagoAbierto(false);
  };

  const confirmarPagoYRegistrar = async () => {
    if (tipoPago === "efectivo") {
      const monto = parseFloat(montoEfectivo) || 0;

      if (monto < total) {
        toast.error(t("orders.messages.insufficientCash"));
        return;
      }
    } else if (!esGestor) {

      if (!/^\d{16}$/.test(numeroTarjeta)) {
        toast.error(t("orders.messages.invalidCard"));
        return;
      }

      if (!nombreTarjeta.trim()) {
        toast.error(t("orders.messages.cardNameRequired"));
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
        toast.error(t("orders.messages.invalidExpiry"));
        return;
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        toast.error(t("orders.messages.invalidCvv"));
        return;
      }
    }

    const nombreBuscado =
      tipoPago === "efectivo"
        ? "efectivo"
        : tipoPago === "credito"
          ? "crédito"
          : "débito";

    const metodoPago = metodosPago.find((m) =>
      m.Nombre.toLowerCase().includes(nombreBuscado),
    );

    const payload = {
      IdCliente: esGestor
        ? Number(datosEncabezado.IdCliente)
        : usuario.IdUsuario,
      IdMetodoEntrega: Number(datosEncabezado.IdMetodoEntrega),
      DireccionEntrega: esDomicilio ? datosEncabezado.DireccionEntrega : null,
      CostoEnvio: costoEnvio,
      Subtotal: subtotal,
      Impuesto: impuesto,
      Total: total,
      Detalles: lineas.map((linea) => ({
        IdProducto: linea.tipo === "Producto" ? linea.idItem : null,
        IdCombo: linea.tipo === "Combo" ? linea.idItem : null,
        Cantidad: linea.cantidad,
        PrecioUnitario: linea.precioUnitario,
        Subtotal: linea.subtotal,
        Impuesto: linea.impuesto,
        Observaciones: linea.observaciones || null,
      })),
      Pago: {
        TipoPago: tipoPago,
        IdMetodoPago: metodoPago?.IdMetodoPago,
        MontoPagado:
          tipoPago === "efectivo" ? parseFloat(montoEfectivo) : total,
        Vuelto: tipoPago === "efectivo" ? vuelto : null,
        UltimosDigitos:
          !esGestor && (tipoPago === "credito" || tipoPago === "debito")
            ? numeroTarjeta.slice(-4)
            : null,
      },
    };

    setEnviando(true);

    try {
      const response = await PedidoService.create(payload);

      toast.success(t("orders.messages.created"));

      limpiarPedido();
      setDialogoPagoAbierto(false);
      navigate(`/pedidos/${response.data.IdPedido}`);
    } catch (error) {
      const mensaje =
        error.response?.data?.result || t("orders.messages.createError");
      toast.error(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (esCocina) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>{t("access.onlyEncargadoOrClient")}</Typography>
      </Box>
    );
  }

  if (esAdministrador) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>{t("access.onlyEncargadoOrClient")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      <Card sx={{ p: 4, borderRadius: 4, border: "2px solid #FF8C00" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {t("orders.newOrderTitle")}
          </Typography>

          <Chip
            label={t("orders.statusInitial")}
            sx={{ bgcolor: "#111", color: "#FF8C00", fontWeight: "bold" }}
          />
        </Box>

        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          {formatDateTime(new Date(), i18n.language)}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Cliente */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              {t("orders.client")}
            </Typography>

            {esGestor ? (
              <>
                <Controller
                  name="IdCliente"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      size="small"
                      label={t("orders.selectClient")}
                    >
                      {clientes.map((cliente) => (
                        <MenuItem
                          key={cliente.IdUsuario}
                          value={cliente.IdUsuario}
                        >
                          {cliente.NombreCompleto}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {clienteElegido && (
                  <Box
                    sx={{ mt: 1, p: 1.5, bgcolor: "#FFF3E0", borderRadius: 2 }}
                  >
                    <Typography variant="body2">
                      {clienteElegido.Correo}
                    </Typography>
                    <Typography variant="body2">
                      {clienteElegido.Direccion || t("orders.noAddress")}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ p: 1.5, bgcolor: "#FFF3E0", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {usuario?.NombreCompleto}
                </Typography>
                <Typography variant="body2">{usuario?.Correo}</Typography>
              </Box>
            )}
          </Grid>

          {esGestor && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {t("orders.manager")}
              </Typography>

              <Box sx={{ p: 1.5, bgcolor: "#FFF3E0", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {usuario?.NombreCompleto}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="IdMetodoEntrega"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label={t("orders.deliveryMethod")}
                  error={!!errors.IdMetodoEntrega}
                  helperText={errors.IdMetodoEntrega?.message}
                >
                  {metodosEntrega.map((metodo) => (
                    <MenuItem
                      key={metodo.IdMetodoEntrega}
                      value={metodo.IdMetodoEntrega}
                    >
                      {metodo.Descripcion}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {esDomicilio && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="DireccionEntrega"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label={t("orders.deliveryAddress")}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          {t("orders.addItem")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            mb: 3,
          }}
        >
          <TextField
            select
            size="small"
            label={t("orders.item")}
            value={itemSeleccionado}
            onChange={(event) => setItemSeleccionado(event.target.value)}
            sx={{ minWidth: 260 }}
          >
            {itemsDisponibles.map((item) => (
              <MenuItem
                key={`${item.tipo}:${item.idItem}`}
                value={`${item.tipo}:${item.idItem}`}
              >
                {item.tipo === "Combo" ? "🍔 " : ""}
                {item.nombre}
              </MenuItem>
            ))}
          </TextField>

          {itemElegido && (
            <Typography sx={{ fontWeight: 700, color: "#FF8C00" }}>
              {formatCurrency(itemElegido.precio, i18n.language)}
            </Typography>
          )}

          <TextField
            size="small"
            label={t("orders.quantity")}
            value={cantidadNueva}
            onChange={(event) =>
              setCantidadNueva(event.target.value.replace(/[^0-9]/g, ""))
            }
            slotProps={{
              htmlInput: { inputMode: "numeric", style: { width: 60 } },
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={manejarAgregarLinea}
            sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#E67E00" } }}
          >
            {t("actions.add")}
          </Button>
        </Box>

        {lineas.length === 0 ? (
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            {t("orders.noLinesYet")}
          </Typography>
        ) : (
          <Table size="small" sx={{ mb: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t("orders.item")}</TableCell>
                <TableCell align="right">{t("orders.unitPrice")}</TableCell>
                <TableCell align="right">{t("orders.quantity")}</TableCell>
                <TableCell align="right">{t("orders.subtotal")}</TableCell>
                <TableCell align="right">{t("orders.tax")}</TableCell>
                <TableCell>{t("orders.observations")}</TableCell>
                <TableCell align="center">{t("actions.delete")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {lineas.map((linea) => (
                <LineaPedidoRow
                  key={linea.key}
                  linea={linea}
                  idioma={i18n.language}
                  onCambiarCantidad={actualizarCantidad}
                  onCambiarObservaciones={actualizarObservaciones}
                  onEliminar={eliminarLinea}
                />
              ))}
            </TableBody>
          </Table>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ ml: "auto", maxWidth: 320 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography>{t("orders.subtotalWithoutTax")}</Typography>
            <Typography>{formatCurrency(subtotal, i18n.language)}</Typography>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography>{t("orders.tax")}</Typography>
            <Typography>{formatCurrency(impuesto, i18n.language)}</Typography>
          </Box>

          {esDomicilio && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography>{t("orders.shippingCost")}</Typography>
              <Typography>
                {formatCurrency(costoEnvio, i18n.language)}
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
              {formatCurrency(total, i18n.language)}
            </Typography>
          </Box>

          {totalUsd !== null && (
            <Typography
              sx={{ textAlign: "right", color: "text.secondary", fontSize: 13, mt: 0.3 }}
            >
              ≈ ${totalUsd.toFixed(2)} USD
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PaymentIcon />}
            onClick={handleSubmit(onSubmitEncabezado)}
            sx={{
              bgcolor: "#111",
              color: "#FF8C00",
              fontWeight: "bold",
              px: 5,
              borderRadius: "30px",
              "&:hover": { bgcolor: "#222" },
            }}
          >
            {t("orders.payAndConfirm")}
          </Button>
        </Box>

        <Typography
          sx={{
            textAlign: "center",
            mt: 1,
            color: "text.secondary",
            fontSize: 13,
          }}
        >
          {t("orders.itemCountLabel", { cantidad: cantidadTotal })}
        </Typography>
      </Card>

      <Dialog
        open={dialogoPagoAbierto}
        onClose={cerrarDialogoPago}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("orders.paymentTitle")}</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2, fontWeight: 700 }}>
            {t("orders.totalToPay")}: {formatCurrency(total, i18n.language)}
          </Typography>

          <RadioGroup
            value={tipoPago}
            onChange={(event) => setTipoPago(event.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel
              value="efectivo"
              control={<Radio />}
              label={t("orders.cash")}
            />

            <FormControlLabel
              value="credito"
              control={<Radio />}
              label={t("orders.creditCard")}
            />
            <FormControlLabel
              value="debito"
              control={<Radio />}
              label={t("orders.debitCard")}
            />
            
          </RadioGroup>

          {tipoPago === "efectivo" && (
            <>
              <TextField
                fullWidth
                margin="dense"
                label={t("orders.cashGiven")}
                value={montoEfectivo}
                onChange={(event) =>
                  setMontoEfectivo(event.target.value.replace(/[^0-9.]/g, ""))
                }
              />

              <Typography sx={{ mt: 1 }}>
                {t("orders.change")}: {formatCurrency(vuelto, i18n.language)}
              </Typography>
            </>
          )}

          {!esGestor && (tipoPago === "credito" || tipoPago === "debito") && (
            <>
              <TextField
                fullWidth
                margin="dense"
                label={t("orders.cardNumber")}
                value={numeroTarjeta}
                onChange={(event) =>
                  setNumeroTarjeta(
                    event.target.value.replace(/[^0-9]/g, "").slice(0, 16),
                  )
                }
                placeholder="4111111111111111"
              />

              <TextField
                fullWidth
                margin="dense"
                label={t("orders.cardName")}
                value={nombreTarjeta}
                onChange={(event) => setNombreTarjeta(event.target.value)}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  margin="dense"
                  label={t("orders.expiry")}
                  placeholder="MM/AA"
                  value={vencimiento}
                  onChange={(event) => setVencimiento(event.target.value)}
                  sx={{ flex: 1 }}
                />

                <TextField
                  margin="dense"
                  label="CVV"
                  value={cvv}
                  onChange={(event) =>
                    setCvv(
                      event.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                    )
                  }
                  sx={{ flex: 1 }}
                />
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarDialogoPago}>{t("actions.cancel")}</Button>

          <Button
            variant="contained"
            disabled={enviando}
            onClick={confirmarPagoYRegistrar}
            sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#E67E00" } }}
          >
            {enviando ? t("orders.processing") : t("orders.confirmPayment")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
