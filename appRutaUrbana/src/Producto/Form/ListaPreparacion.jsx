import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Grid,
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
  ZoomIn as ZoomInIcon,
  Add as AddIcon,
  RemoveCircle as RemoveIcon,
} from "@mui/icons-material";

import PreparacionService from "../../services/PreparacionService";
import EstacionService from "../../services/EstacionService";
import ProductoService from "../../services/ProductoService";

const orangeIcon = {
  color: "#FF8C00",
};

const pasoVacio = () => ({
  IdProceso: null,
  IdEstacion: "",
  OrdenPaso: 0,
  TiempoEstimadoMinutos: 0,
});

export default function ListPreparacionPublic() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [productos, setProductos] = useState([]);

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
      toast.error("Error al cargar");
    }
  };

  const cargarEstaciones = async () => {
    try {
      const response = await EstacionService.getEstaciones();

      setEstaciones(response.data);
    } catch (e) {
      toast.error("Error al cargar estaciones");
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();

      setProductos(response.data);
    } catch (e) {
      toast.error("Error al cargar productos");
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEstaciones();
    cargarProductos();
  }, []);

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

  const handleSave = async () => {
    const invalido = pasosForm.some(
      (p) => !p.IdEstacion || !p.OrdenPaso || !p.TiempoEstimadoMinutos,
    );

    if (invalido) {
      toast.error("Completa Orden, Estación y Minutos en todos los pasos");

      return;
    }

    const ordenes = pasosForm
      .map((p) => Number(p.OrdenPaso))
      .sort((a, b) => a - b);

    const hayOrdenesRepetidos = new Set(ordenes).size !== ordenes.length;

    if (hayOrdenesRepetidos) {
      toast.error("No se pueden repetir los números de orden");

      return;
    }

    const ordenNoConsecutivo = ordenes.some(
      (orden, index) => orden !== index + 1,
    );

    if (ordenNoConsecutivo) {
      toast.error(
        "Los pasos deben seguir una secuencia consecutiva: 1, 2, 3, ...",
      );

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

      toast.success("Guardado correctamente");

      setOpen(false);
      setPasosEliminados([]);
      setPasosForm([]);

      await cargarDatos();
    } catch (e) {
      toast.error("Error al guardar en BD");
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
      toast.error("Selecciona un producto");
      return;
    }

    if (pasosNuevo.length === 0) {
      toast.error("Agrega al menos un paso");
      return;
    }

    const invalido = pasosNuevo.some(
      (p) => !p.IdEstacion || !p.OrdenPaso || !p.TiempoEstimadoMinutos,
    );

    if (invalido) {
      toast.error("Completa Orden, Estación y Minutos en todos los pasos");
      return;
    }

    const ordenes = pasosNuevo
      .map((p) => Number(p.OrdenPaso))
      .sort((a, b) => a - b);

    const hayOrdenesRepetidos = new Set(ordenes).size !== ordenes.length;

    if (hayOrdenesRepetidos) {
      toast.error("No se pueden repetir los números de orden");
      return;
    }

    const ordenNoConsecutivo = ordenes.some(
      (orden, index) => orden !== index + 1,
    );

    if (ordenNoConsecutivo) {
      toast.error(
        "Los pasos deben seguir una secuencia consecutiva: 1, 2, 3, ...",
      );
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

      toast.success("Proceso creado correctamente");

      setOpenCreate(false);
      setPasosNuevo([]);
      setIdSeleccionado("");

      await cargarDatos();
    } catch (e) {
      toast.error("Error al crear el proceso");
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

      toast.success("Proceso eliminado correctamente");

      setOpenDelete(false);
      setProcesoEliminar(null);

      await cargarDatos();
    } catch (e) {
      console.error("Error eliminando proceso:", e);
      toast.error("Error al eliminar el proceso");
    } finally {
      setEliminando(null);
    }
  };

  const blackIcon = {
    color: "#000",
  };

  const redIcon = {
    color: "#d32f2f",
  };

  const grayIcon = {
    color: "#616161",
  };

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
            Procesos
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "#FF8C00",
            }}
            onClick={abrirCreacion}
          >
            Crear Proceso
          </Button>
        </Box>

        <Grid container spacing={2}>
          {data.map((item, index) => {
            const key = item.IdProducto
              ? `prod-${item.IdProducto}`
              : `combo-${item.IdCombo}`;

            return (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
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
                      label={`Pasos: ${item.pasos.length}`}
                      size="small"
                      color={item.esProducto ? "primary" : "success"}
                      sx={{
                        mt: 1,
                      }}
                    />
                  </CardContent>

                  <CardActions
                    sx={{
                      justifyContent: "flex-end",
                    }}
                  >
                    <IconButton
                      onClick={() =>
                        navigate(
                          item.IdProducto
                            ? `/preparacion/${item.IdProducto}`
                            : `/preparacion/combo/${item.IdCombo}`,
                        )
                      }
                      sx={blackIcon}
                    >
                      <ZoomInIcon />
                    </IconButton>

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
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* CONFIRMAR ELIMINACIÓN */}

      <Dialog
        open={openDelete}
        onClose={() => {
          if (!eliminando) {
            setOpenDelete(false);
            setProcesoEliminar(null);
          }
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>

        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar todo el proceso de preparación de
            <b> {procesoEliminar?.Nombre}</b>?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Se eliminarán <b>{procesoEliminar?.pasos?.length || 0}</b> paso(s)
            de preparación.
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
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleEliminarProceso}
            disabled={!!eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDITAR PROCESO */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar: {procesoEdit?.Nombre}</DialogTitle>

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
                label="Orden"
                size="small"
                sx={{
                  width: 90,
                  minWidth: 90,
                  flexShrink: 0,
                }}
                value={paso.OrdenPaso}
                onChange={(e) =>
                  modificarPaso(
                    setPasosForm,
                    index,
                    "OrdenPaso",
                    e.target.value,
                  )
                }
              />

              <TextField
                select
                label="Estación"
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
                label="Minutos"
                size="small"
                sx={{
                  width: 110,
                  minWidth: 110,
                  flexShrink: 0,
                }}
                value={paso.TiempoEstimadoMinutos}
                onChange={(e) =>
                  modificarPaso(
                    setPasosForm,
                    index,
                    "TiempoEstimadoMinutos",
                    e.target.value,
                  )
                }
              />

              <IconButton
                color="error"
                onClick={() => handleRemoverPaso(index)}
                sx={{
                  flexShrink: 0,
                }}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => agregarPaso(setPasosForm)}
          >
            Agregar Paso
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>

          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#FF8C00",
            }}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREAR PROCESO */}

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Crear nuevo proceso</DialogTitle>

        <DialogContent>
          <TextField
            select
            label="Producto"
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
                label="Orden"
                size="small"
                sx={{
                  width: 90,
                  minWidth: 90,
                  flexShrink: 0,
                }}
                value={paso.OrdenPaso}
                onChange={(e) =>
                  modificarPaso(
                    setPasosNuevo,
                    index,
                    "OrdenPaso",
                    e.target.value,
                  )
                }
              />

              <TextField
                select
                label="Estación"
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
                label="Minutos"
                size="small"
                sx={{
                  width: 110,
                  minWidth: 110,
                  flexShrink: 0,
                }}
                value={paso.TiempoEstimadoMinutos}
                onChange={(e) =>
                  modificarPaso(
                    setPasosNuevo,
                    index,
                    "TiempoEstimadoMinutos",
                    e.target.value,
                  )
                }
              />

              <IconButton
                color="error"
                onClick={() => handleRemoverPasoNuevo(index)}
                sx={{
                  flexShrink: 0,
                }}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => agregarPaso(setPasosNuevo)}
          >
            Agregar Paso
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>

          <Button
            onClick={handleCrearProceso}
            variant="contained"
            sx={{
              bgcolor: "#FF8C00",
            }}
            disabled={guardandoNuevo}
          >
            {guardandoNuevo ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
