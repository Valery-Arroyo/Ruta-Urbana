import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  RemoveCircle as RemoveIcon,
} from "@mui/icons-material";

import PreparacionService from "../../services/PreparacionService";
import EstacionService from "../../services/EstacionService";
import ProductoService from "../../services/ProductoService";
import ComboService from "../../services/ComboService";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

const orangeIcon = {
  color: "#FF8C00",
};

const pasoVacio = () => ({
  IdProceso: null,
  IdEstacion: "",
  OrdenPaso: "",
  TiempoEstimadoMinutos: "",
});

export default function ListPreparacionPublic() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rol } = useAuth();
  const esAdministrador = rol === ROLES.ADMINISTRADOR;
  const esCocina = rol === ROLES.COCINA;
  const esGestor = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;

  const [data, setData] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);

  const [open, setOpen] = useState(false);
  const [procesoEdit, setProcesoEdit] = useState(null);
  const [pasosForm, setPasosForm] = useState([]);
  const [pasosEliminados, setPasosEliminados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [pasosNuevo, setPasosNuevo] = useState([]);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  const [eliminando, setEliminando] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [procesoEliminar, setProcesoEliminar] = useState(null);

  const cargarDatos = async () => {
    try {
      const response = await PreparacionService.getPreparaciones();

      const agrupado = response.data.reduce((acc, item) => {
        const idProd = item.IdProducto || item.idProducto || item.idproducto;

        const idCombo = item.IdCombo || item.idCombo || item.idcombo;

        const idProceso = item.IdProceso || item.idProceso || item.idproceso;

        const key = idProd ? `prod-${idProd}` : `combo-${idCombo}`;

        if (!acc[key]) {
          acc[key] = {
            Nombre: item.NombreProducto || item.NombreCombo,
            IdProducto: idProd,
            IdCombo: idCombo,
            esProducto: !!idProd,
            pasos: [],
          };
        }

        acc[key].pasos.push({
          IdProceso: idProceso ? Number(idProceso) : null,

          IdEstacion: Number(item.IdEstacion || item.idEstacion || 0),

          OrdenPaso: Number(item.OrdenPaso || item.ordenPaso || 0),

          TiempoEstimadoMinutos: Number(
            item.TiempoEstimadoMinutos || item.tiempoEstimadoMinutos || 0,
          ),
        });

        return acc;
      }, {});

      setData(Object.values(agrupado));
    } catch (e) {
      console.error("Error cargando procesos:", e);
      toast.error(t("preparations.messages.loadError"));
    }
  };

  const cargarEstaciones = async () => {
    try {
      const response = await EstacionService.getEstaciones();

      setEstaciones(response.data || []);
    } catch (e) {
      console.error("Error cargando estaciones:", e);
      toast.error(t("preparations.messages.loadStationsError"));
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();

      setProductos(response.data || []);
    } catch (e) {
      console.error("Error cargando productos:", e);
      toast.error(t("preparations.messages.loadProductsError"));
    }
  };

  const cargarCombos = async () => {
    try {
      const response = await ComboService.getCombos();

      setCombos(response.data || []);
    } catch (e) {
      console.error("Error cargando combos:", e);
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEstaciones();
    cargarProductos();
    cargarCombos();
  }, []);

  /*
   * Busca la imagen del producto o combo del proceso, para que las
   * tarjetas no se vean tan vacías (solo texto).
   */
  const obtenerImagenProceso = (item) => {
    const origen = item.esProducto
      ? productos.find((p) => Number(p.IdProducto) === Number(item.IdProducto))
      : combos.find((c) => Number(c.IdCombo) === Number(item.IdCombo));

    const imagenGuardada = item.esProducto
      ? origen?.Imagenes || origen?.Imagen
      : origen?.RutaImagen;

    if (!imagenGuardada) {
      return "/no-image.png";
    }

    const primeraImagen = String(imagenGuardada).split(",")[0].trim();

    if (
      primeraImagen.startsWith("http://") ||
      primeraImagen.startsWith("https://")
    ) {
      return primeraImagen;
    }

    return `http://localhost:81/apirutaurbana/${primeraImagen}`;
  };

  const modificarPaso = (setter, index, campo, valor) => {
    setter((prev) =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              [campo]: valor,
            }
          : p,
      ),
    );
  };

  /*
   * Permite únicamente números enteros.
   *
   * Si el usuario intenta ingresar letras, espacios,
   * puntos, comas o signos, muestra un toast y
   * no agrega el carácter inválido.
   */
  const manejarCampoNumerico = (setter, index, campo, valor) => {
    if (/^\d*$/.test(valor)) {
      modificarPaso(setter, index, campo, valor);
      return;
    }

    toast.error(t("preparations.messages.onlyIntegers"), {
      id: "validacion-campo-numerico",
    });
  };

  const agregarPaso = (setter) => {
    setter((prev) => [...prev, pasoVacio()]);
  };

  const abrirEdicion = (item) => {
    setProcesoEdit(item);
    setPasosEliminados([]);

    setPasosForm(
      item.pasos.map((p) => ({
        ...p,
      })),
    );

    setOpen(true);
  };

  /*
   * Elimina un paso dentro del diálogo de edición.
   *
   * Si ya existe en la base de datos, almacena su
   * IdProceso para eliminarlo cuando se guarden
   * los cambios.
   */
  const handleRemoverPaso = (index) => {
    setPasosForm((prev) => {
      const pasoEliminar = prev[index];

      if (pasoEliminar?.IdProceso) {
        setPasosEliminados((anteriores) => {
          const idProceso = Number(pasoEliminar.IdProceso);

          if (anteriores.some((id) => Number(id) === idProceso)) {
            return anteriores;
          }

          return [...anteriores, idProceso];
        });
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (pasosForm.length === 0) {
      toast.error(t("preparations.messages.noSteps"));
      return;
    }

    const invalido = pasosForm.some(
      (p) =>
        !p.IdEstacion ||
        Number(p.OrdenPaso) <= 0 ||
        Number(p.TiempoEstimadoMinutos) <= 0,
    );

    if (invalido) {
      toast.error(t("preparations.messages.incompleteSteps"));

      return;
    }

    const ordenes = pasosForm
      .map((p) => Number(p.OrdenPaso))
      .sort((a, b) => a - b);

    const hayOrdenesRepetidos = new Set(ordenes).size !== ordenes.length;

    if (hayOrdenesRepetidos) {
      toast.error(t("preparations.messages.duplicateOrder"));

      return;
    }

    const ordenNoConsecutivo = ordenes.some(
      (orden, index) => orden !== index + 1,
    );

    if (ordenNoConsecutivo) {
      toast.error(t("preparations.messages.nonConsecutiveOrder"));

      return;
    }

    setGuardando(true);

    try {
      if (pasosEliminados.length > 0) {
        await Promise.all(
          pasosEliminados.map((id) => PreparacionService.deletePreparacion(id)),
        );
      }

      await Promise.all(
        pasosForm.map((p) => {
          const payload = {
            IdProceso: p.IdProceso || null,

            OrdenPaso: Number(p.OrdenPaso),

            TiempoEstimadoMinutos: Number(p.TiempoEstimadoMinutos),

            IdEstacion: Number(p.IdEstacion),

            IdProducto: procesoEdit?.IdProducto || null,

            IdCombo: procesoEdit?.IdCombo || null,
          };

          return payload.IdProceso
            ? PreparacionService.updatePreparacion(payload.IdProceso, payload)
            : PreparacionService.createPreparacion(payload);
        }),
      );

      toast.success(t("preparations.messages.updated"));

      setOpen(false);
      setProcesoEdit(null);
      setPasosEliminados([]);
      setPasosForm([]);

      await cargarDatos();
    } catch (e) {
      console.error("Error actualizando proceso:", e);
      toast.error(t("preparations.messages.updateError"));
    } finally {
      setGuardando(false);
    }
  };

  const idsProductosConProceso = new Set(
    data.filter((d) => d.esProducto).map((d) => Number(d.IdProducto)),
  );

  const productosDisponibles = productos.filter(
    (p) => !idsProductosConProceso.has(Number(p.IdProducto)),
  );

  const abrirCreacion = () => {
    setIdSeleccionado("");
    setPasosNuevo([]);
    setOpenCreate(true);
  };

  const handleRemoverPasoNuevo = (index) => {
    setPasosNuevo((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCrearProceso = async () => {
    if (!idSeleccionado) {
      toast.error(t("preparations.messages.selectProduct"));
      return;
    }

    if (pasosNuevo.length === 0) {
      toast.error(t("preparations.messages.addAtLeastOneStep"));
      return;
    }

    const invalido = pasosNuevo.some(
      (p) =>
        !p.IdEstacion ||
        Number(p.OrdenPaso) <= 0 ||
        Number(p.TiempoEstimadoMinutos) <= 0,
    );

    if (invalido) {
      toast.error(t("preparations.messages.incompleteSteps"));
      return;
    }

    const ordenes = pasosNuevo
      .map((p) => Number(p.OrdenPaso))
      .sort((a, b) => a - b);

    const hayOrdenesRepetidos = new Set(ordenes).size !== ordenes.length;

    if (hayOrdenesRepetidos) {
      toast.error(t("preparations.messages.duplicateOrder"));
      return;
    }

    const ordenNoConsecutivo = ordenes.some(
      (orden, index) => orden !== index + 1,
    );

    if (ordenNoConsecutivo) {
      toast.error(t("preparations.messages.nonConsecutiveOrder"));
      return;
    }

    setGuardandoNuevo(true);

    try {
      await Promise.all(
        pasosNuevo.map((p) => {
          const payload = {
            OrdenPaso: Number(p.OrdenPaso),

            TiempoEstimadoMinutos: Number(p.TiempoEstimadoMinutos),

            IdEstacion: Number(p.IdEstacion),

            IdProducto: Number(idSeleccionado),

            IdCombo: null,
          };

          return PreparacionService.createPreparacion(payload);
        }),
      );

      toast.success(t("preparations.messages.created"));

      setOpenCreate(false);
      setPasosNuevo([]);
      setIdSeleccionado("");

      await cargarDatos();
    } catch (e) {
      console.error("Error creando proceso:", e);
      toast.error(t("preparations.messages.createError"));
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const confirmarEliminarProceso = (item) => {
    setProcesoEliminar(item);
    setOpenDelete(true);
  };

  const handleEliminarProceso = async () => {
    if (!procesoEliminar) {
      return;
    }

    const key = procesoEliminar.IdProducto
      ? `prod-${procesoEliminar.IdProducto}`
      : `combo-${procesoEliminar.IdCombo}`;

    setEliminando(key);

    try {
      await Promise.all(
        procesoEliminar.pasos
          .filter((p) => p.IdProceso)
          .map((p) => PreparacionService.deletePreparacion(p.IdProceso)),
      );

      toast.success(t("preparations.messages.deleted"));

      setOpenDelete(false);
      setProcesoEliminar(null);

      await cargarDatos();
    } catch (e) {
      console.error("Error eliminando proceso:", e);
      toast.error(t("preparations.messages.deleteError"));
    } finally {
      setEliminando(null);
    }
  };

  const redIcon = {
    color: "#d32f2f",
  };

  const grayIcon = {
    color: "#616161",
  };

  const puedeEditar = esAdministrador || esCocina;

  if (!esGestor && !esCocina) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>{t("access.onlyAdminOrKitchen")}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "black",
            }}
          >
            {t("preparations.title")}
          </Typography>

          {puedeEditar && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: "#FF8C00",
              }}
              onClick={abrirCreacion}
            >
              {t("preparations.create")}
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "grid",
            justifyContent: "center",
            gap: 2,

            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2,270px)",
              md: "repeat(3,270px)",
              lg: "repeat(4,270px)",
            },
          }}
        >
          {data.map((item, index) => {
            const key = item.IdProducto
              ? `prod-${item.IdProducto}`
              : `combo-${item.IdCombo}`;

            return (
              <Card
                key={key || index}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                  <CardMedia
                    component="img"
                    height="140"
                    image={obtenerImagenProceso(item)}
                    alt={item.Nombre}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/no-image.png";
                    }}
                    sx={{
                      objectFit: "cover",
                    }}
                  />

                  <CardContent
                    sx={{
                      p: 1.5,
                      pb: "0 !important",
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {item.Nombre}
                    </Typography>

                    <Chip
                      label={`${t("preparations.steps")}: ${item.pasos.length}`}
                      size="small"
                      color={item.esProducto ? "primary" : "success"}
                      sx={{
                        mt: 1,
                      }}
                    />
                  </CardContent>

                  <CardActions
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      alignItems: "center",
                    }}
                  >
                    <Box />

                    <Button
                      size="medium"
                      onClick={() =>
                        navigate(
                          item.IdProducto
                            ? `/preparacion/${item.IdProducto}`
                            : `/preparacion/combo/${item.IdCombo}`,
                        )
                      }
                      sx={{
                        justifySelf: "center",
                        color: "#000000",
                        fontWeight: "bold",
                        textTransform: "none",
                        fontSize: "1rem",
                        px: 3,
                        py: 0.8,

                        "&:hover": {
                          bgcolor: "rgba(255,140,0,.1)",
                        },
                      }}
                    >
                      {t("actions.viewDetail")}
                    </Button>

                    <Box sx={{ justifySelf: "end", display: "flex" }}>
                    {puedeEditar && (
                      <>
                        <IconButton
                          onClick={() => abrirEdicion(item)}
                          sx={grayIcon}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => confirmarEliminarProceso(item)}
                          disabled={eliminando === key}
                          sx={redIcon}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    </Box>
                  </CardActions>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* CONFIRMAR ELIMINACIÓN DEL PROCESO COMPLETO */}

      <Dialog
        open={openDelete}
        onClose={() => {
          if (!eliminando) {
            setOpenDelete(false);
            setProcesoEliminar(null);
          }
        }}
      >
        <DialogTitle>{t("preparations.confirmDeleteTitle")}</DialogTitle>

        <DialogContent>
          <Typography>
            {t("preparations.confirmDeleteMessage")}
            <b> {procesoEliminar?.Nombre}</b>?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            {t("preparations.willDeleteSteps")}{" "}
            <b>{procesoEliminar?.pasos?.length || 0}</b>{" "}
            {t("preparations.stepsWord")}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenDelete(false);
              setProcesoEliminar(null);
            }}
            disabled={!!eliminando}
          >
            {t("actions.cancel")}
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleEliminarProceso}
            disabled={!!eliminando}
          >
            {eliminando ? t("preparations.deleting") : t("actions.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDITAR PROCESO */}

      <Dialog
        open={open}
        onClose={() => {
          if (!guardando) {
            setOpen(false);
            setProcesoEdit(null);
            setPasosEliminados([]);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {t("preparations.editTitle")}: {procesoEdit?.Nombre}
        </DialogTitle>

        <DialogContent>
          {pasosForm.map((paso, index) => (
            <Box
              key={paso.IdProceso ?? `nuevo-${index}`}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                mb: 2,
                mt: 1,
              }}
            >
              <TextField
                label={t("preparations.order")}
                size="small"
                sx={{
                  width: 90,
                  minWidth: 90,
                  flexShrink: 0,
                }}
                value={paso.OrdenPaso}
                onChange={(e) =>
                  manejarCampoNumerico(
                    setPasosForm,
                    index,
                    "OrdenPaso",
                    e.target.value,
                  )
                }
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 1,
                  },
                }}
              />

              <TextField
                select
                label={t("preparations.station")}
                size="small"
                fullWidth
                value={paso.IdEstacion || ""}
                onChange={(e) =>
                  modificarPaso(
                    setPasosForm,
                    index,
                    "IdEstacion",
                    Number(e.target.value),
                  )
                }
              >
                {estaciones.map((est) => (
                  <MenuItem key={est.IdEstacion} value={est.IdEstacion}>
                    {est.Nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label={t("preparations.minutes")}
                size="small"
                sx={{
                  width: 110,
                  minWidth: 110,
                  flexShrink: 0,
                }}
                value={paso.TiempoEstimadoMinutos}
                onChange={(e) =>
                  manejarCampoNumerico(
                    setPasosForm,
                    index,
                    "TiempoEstimadoMinutos",
                    e.target.value,
                  )
                }
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 1,
                  },
                }}
              />

              <IconButton
                color="error"
                onClick={() => handleRemoverPaso(index)}
                sx={{
                  flexShrink: 0,
                }}
                disabled={guardando}
                title={t("preparations.deleteStepTitle")}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => agregarPaso(setPasosForm)}
            disabled={guardando}
          >
            {t("preparations.addStep")}
          </Button>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setProcesoEdit(null);
              setPasosEliminados([]);
            }}
            disabled={guardando}
          >
            {t("actions.cancel")}
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#FF8C00",
            }}
            disabled={guardando}
          >
            {guardando ? t("preparations.updating") : t("actions.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREAR PROCESO */}

      <Dialog
        open={openCreate}
        onClose={() => {
          if (!guardandoNuevo) {
            setOpenCreate(false);
            setPasosNuevo([]);
            setIdSeleccionado("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("preparations.createNew")}</DialogTitle>

        <DialogContent>
          <TextField
            select
            label={t("preparations.product")}
            size="small"
            fullWidth
            sx={{
              mb: 2,
              mt: 1,
            }}
            value={idSeleccionado}
            onChange={(e) => setIdSeleccionado(e.target.value)}
          >
            {productosDisponibles.map((item) => (
              <MenuItem key={item.IdProducto} value={item.IdProducto}>
                {item.Nombre}
              </MenuItem>
            ))}
          </TextField>

          {pasosNuevo.map((paso, index) => (
            <Box
              key={`nuevo-${index}`}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                label={t("preparations.order")}
                size="small"
                sx={{
                  width: 90,
                  minWidth: 90,
                  flexShrink: 0,
                }}
                value={paso.OrdenPaso}
                onChange={(e) =>
                  manejarCampoNumerico(
                    setPasosNuevo,
                    index,
                    "OrdenPaso",
                    e.target.value,
                  )
                }
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 1,
                  },
                }}
              />

              <TextField
                select
                label={t("preparations.station")}
                size="small"
                fullWidth
                value={paso.IdEstacion || ""}
                onChange={(e) =>
                  modificarPaso(
                    setPasosNuevo,
                    index,
                    "IdEstacion",
                    Number(e.target.value),
                  )
                }
              >
                {estaciones.map((est) => (
                  <MenuItem key={est.IdEstacion} value={est.IdEstacion}>
                    {est.Nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label={t("preparations.minutes")}
                size="small"
                sx={{
                  width: 110,
                  minWidth: 110,
                  flexShrink: 0,
                }}
                value={paso.TiempoEstimadoMinutos}
                onChange={(e) =>
                  manejarCampoNumerico(
                    setPasosNuevo,
                    index,
                    "TiempoEstimadoMinutos",
                    e.target.value,
                  )
                }
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 1,
                  },
                }}
              />

              <IconButton
                color="error"
                onClick={() => handleRemoverPasoNuevo(index)}
                sx={{
                  flexShrink: 0,
                }}
                disabled={guardandoNuevo}
                title={t("preparations.deleteStepTitle")}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => agregarPaso(setPasosNuevo)}
            disabled={guardandoNuevo}
          >
            {t("preparations.addStep")}
          </Button>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreate(false);
              setPasosNuevo([]);
              setIdSeleccionado("");
            }}
            disabled={guardandoNuevo}
          >
            {t("actions.cancel")}
          </Button>

          <Button
            onClick={handleCrearProceso}
            variant="contained"
            sx={{
              bgcolor: "#FF8C00",
            }}
            disabled={guardandoNuevo}
          >
            {guardandoNuevo ? t("preparations.creating") : t("actions.create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
