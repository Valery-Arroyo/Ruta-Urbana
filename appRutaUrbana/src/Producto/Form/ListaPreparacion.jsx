import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardActions, IconButton, Typography, Grid, Box, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, ZoomIn as ZoomInIcon, Add as AddIcon, RemoveCircle as RemoveIcon } from "@mui/icons-material";
import PreparacionService from "../../services/PreparacionService";
import EstacionService from "../../services/EstacionService";
import ProductoService from "../../services/ProductoService";

const orangeIcon = { color: "#FF8C00" };

const pasoVacio = () => ({
  IdProceso: null,
  IdEstacion: '',
  OrdenPaso: 0,
  TiempoEstimadoMinutos: 0,
});

export default function ListPreparacionPublic() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [productos, setProductos] = useState([]);

  // --- Estado edición de proceso existente ---
  const [open, setOpen] = useState(false);
  const [procesoEdit, setProcesoEdit] = useState(null);
  const [pasosForm, setPasosForm] = useState([]);
  const [pasosEliminados, setPasosEliminados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // --- Estado creación de proceso nuevo ---
  const [openCreate, setOpenCreate] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const [pasosNuevo, setPasosNuevo] = useState([]);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  // --- Estado eliminación de proceso completo ---
  const [eliminando, setEliminando] = useState(null); // guarda la key del item en proceso de borrado

  const cargarDatos = async () => {
    try {
      const response = await PreparacionService.getPreparaciones();
      const agrupado = response.data.reduce((acc, item) => {
        const idProd = item.IdProducto || item.idProducto || item.idproducto;
        const idCombo = item.IdCombo || item.idCombo || item.idcombo;
        const idProceso = item.IdProceso || item.idProceso || item.idproceso;

        const key = idProd ? `prod-${idProd}` : `combo-${idCombo}`;
        if (!acc[key]) {
          acc[key] = { Nombre: item.NombreProducto || item.NombreCombo, IdProducto: idProd, IdCombo: idCombo, esProducto: !!idProd, pasos: [] };
        }
        acc[key].pasos.push({
          IdProceso: idProceso ? Number(idProceso) : null,
          IdEstacion: Number(item.IdEstacion || item.idEstacion || 0),
          OrdenPaso: Number(item.OrdenPaso || item.ordenPaso || 0),
          TiempoEstimadoMinutos: Number(item.TiempoEstimadoMinutos || item.tiempoEstimadoMinutos || 0)
        });
        return acc;
      }, {});
      setData(Object.values(agrupado));
    } catch (e) { toast.error("Error al cargar"); }
  };

  const cargarEstaciones = async () => {
    try {
      const response = await EstacionService.getEstaciones();
      setEstaciones(response.data);
    } catch (e) { toast.error("Error al cargar estaciones"); }
  };

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();
      setProductos(response.data);
    } catch (e) { toast.error("Error al cargar productos"); }
  };

  useEffect(() => {
    cargarDatos();
    cargarEstaciones();
    cargarProductos();
  }, []);

  // --- Helpers genéricos de manejo de pasos (reusados por edición y creación) ---
  const modificarPaso = (setter, index, campo, valor) => {
    setter(prev => prev.map((p, i) => (i === index ? { ...p, [campo]: valor } : p)));
  };

  const agregarPaso = (setter) => {
    setter(prev => [...prev, pasoVacio()]);
  };

  // ================= EDICIÓN DE PROCESO EXISTENTE =================

  const abrirEdicion = (item) => {
    setProcesoEdit(item);
    setPasosEliminados([]);
    // Copia profunda: nunca mutamos directamente los objetos de "data"
    setPasosForm(item.pasos.map(p => ({ ...p })));
    setOpen(true);
  };

  const handleRemoverPaso = (index) => {
    const paso = pasosForm[index];
    // Solo lo mandamos a borrar si YA existía en la BD (tiene IdProceso)
    if (paso?.IdProceso) {
      setPasosEliminados(prev => [...prev, paso.IdProceso]);
    }
    setPasosForm(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const invalido = pasosForm.some(p => !p.IdEstacion || !p.OrdenPaso || !p.TiempoEstimadoMinutos);
    if (invalido) {
      toast.error("Completa Orden, Estación y Minutos en todos los pasos");
      return;
    }

    setGuardando(true);
    try {
      if (pasosEliminados.length > 0) {
        await Promise.all(pasosEliminados.map(id =>
          PreparacionService.deletePreparacion(id)
        ));
      }

      await Promise.all(pasosForm.map(p => {
        const payload = {
          IdProceso: p.IdProceso || null,
          OrdenPaso: Number(p.OrdenPaso),
          TiempoEstimadoMinutos: Number(p.TiempoEstimadoMinutos),
          IdEstacion: Number(p.IdEstacion),
          IdProducto: procesoEdit?.IdProducto || null,
          IdCombo: procesoEdit?.IdCombo || null
        };

        return payload.IdProceso
          ? PreparacionService.updatePreparacion(payload.IdProceso, payload)
          : PreparacionService.createPreparacion(payload);
      }));

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

  // ================= CREACIÓN DE PROCESO NUEVO =================

  // Solo se ofrecen productos que TODAVÍA no tienen proceso
  const idsProductosConProceso = new Set(data.filter(d => d.esProducto).map(d => Number(d.IdProducto)));
  const productosDisponibles = productos.filter(p => !idsProductosConProceso.has(Number(p.IdProducto)));

  const abrirCreacion = () => {
    setIdSeleccionado('');
    setPasosNuevo([]);
    setOpenCreate(true);
  };

  const handleRemoverPasoNuevo = (index) => {
    setPasosNuevo(prev => prev.filter((_, i) => i !== index));
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
    const invalido = pasosNuevo.some(p => !p.IdEstacion || !p.OrdenPaso || !p.TiempoEstimadoMinutos);
    if (invalido) {
      toast.error("Completa Orden, Estación y Minutos en todos los pasos");
      return;
    }

    setGuardandoNuevo(true);
    try {
      await Promise.all(pasosNuevo.map(p => {
        const payload = {
          OrdenPaso: Number(p.OrdenPaso),
          TiempoEstimadoMinutos: Number(p.TiempoEstimadoMinutos),
          IdEstacion: Number(p.IdEstacion),
          IdProducto: Number(idSeleccionado),
          IdCombo: null
        };
        return PreparacionService.createPreparacion(payload);
      }));

      toast.success("Proceso creado correctamente");
      setOpenCreate(false);
      setPasosNuevo([]);
      setIdSeleccionado('');
      await cargarDatos();
    } catch (e) {
      toast.error("Error al crear el proceso");
    } finally {
      setGuardandoNuevo(false);
    }
  };

  // ================= ELIMINACIÓN DE PROCESO COMPLETO =================

  const handleEliminarProceso = async (item) => {
    const confirmado = window.confirm(
      `¿Eliminar todo el proceso de "${item.Nombre}"? Esto borrará sus ${item.pasos.length} paso(s).`
    );
    if (!confirmado) return;

    const key = item.IdProducto ? `prod-${item.IdProducto}` : `combo-${item.IdCombo}`;
    setEliminando(key);
    try {
      await Promise.all(
        item.pasos
          .filter(p => p.IdProceso)
          .map(p => PreparacionService.deletePreparacion(p.IdProceso))
      );
      toast.success("Proceso eliminado correctamente");
      await cargarDatos();
    } catch (e) {
      toast.error("Error al eliminar el proceso");
    } finally {
      setEliminando(null);
    }
  };

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Toaster />
      <Box sx={{ width: "100%", maxWidth: "1200px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", color: "#FF8C00" }}>Procesos</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#FF8C00" }}
            onClick={abrirCreacion}
          >
            Crear Proceso
          </Button>
        </Box>
        <Grid container spacing={2}>
          {data.map((item, index) => {
            const key = item.IdProducto ? `prod-${item.IdProducto}` : `combo-${item.IdCombo}`;
            return (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <Card sx={{ p: 1.5, borderRadius: 3 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography sx={{ fontWeight: "bold" }}>{item.Nombre}</Typography>
                    <Chip label={`Pasos: ${item.pasos.length}`} size="small" color={item.esProducto ? "primary" : "success"} sx={{ mt: 1 }} />
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton onClick={() => abrirEdicion(item)} sx={orangeIcon}><EditIcon /></IconButton>
                    <IconButton
                      onClick={() => handleEliminarProceso(item)}
                      disabled={eliminando === key}
                      sx={orangeIcon}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton onClick={() => navigate(item.IdProducto ? `/preparacion/${item.IdProducto}` : `/preparacion/combo/${item.IdCombo}`)} sx={orangeIcon}><ZoomInIcon /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Dialog de EDICIÓN */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar: {procesoEdit?.Nombre}</DialogTitle>
        <DialogContent>
          {pasosForm.map((paso, index) => (
            <Box key={paso.IdProceso ?? `nuevo-${index}`} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2, mt: 1 }}>
              <TextField
                label="Ord"
                size="small"
                sx={{ width: 60 }}
                value={paso.OrdenPaso}
                onChange={(e) => modificarPaso(setPasosForm, index, "OrdenPaso", e.target.value)}
              />
              <TextField
                select
                label="Estación"
                size="small"
                fullWidth
                value={paso.IdEstacion || ''}
                onChange={(e) => modificarPaso(setPasosForm, index, "IdEstacion", Number(e.target.value))}
              >
                {estaciones.map(est => (
                  <MenuItem key={est.IdEstacion} value={est.IdEstacion}>
                    {est.Nombre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Min"
                size="small"
                sx={{ width: 60 }}
                value={paso.TiempoEstimadoMinutos}
                onChange={(e) => modificarPaso(setPasosForm, index, "TiempoEstimadoMinutos", e.target.value)}
              />
              <IconButton color="error" onClick={() => handleRemoverPaso(index)}><RemoveIcon /></IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={() => agregarPaso(setPasosForm)}>Agregar Paso</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#FF8C00" }} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de CREACIÓN */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Crear nuevo proceso</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Producto"
            size="small"
            fullWidth
            sx={{ mb: 2, mt: 1 }}
            value={idSeleccionado}
            onChange={(e) => setIdSeleccionado(e.target.value)}
          >
            {productosDisponibles.map(item => (
              <MenuItem key={item.IdProducto} value={item.IdProducto}>
                {item.Nombre}
              </MenuItem>
            ))}
          </TextField>

          {pasosNuevo.map((paso, index) => (
            <Box key={`nuevo-${index}`} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
              <TextField
                label="Ord"
                size="small"
                sx={{ width: 60 }}
                value={paso.OrdenPaso}
                onChange={(e) => modificarPaso(setPasosNuevo, index, "OrdenPaso", e.target.value)}
              />
              <TextField
                select
                label="Estación"
                size="small"
                fullWidth
                value={paso.IdEstacion || ''}
                onChange={(e) => modificarPaso(setPasosNuevo, index, "IdEstacion", Number(e.target.value))}
              >
                {estaciones.map(est => (
                  <MenuItem key={est.IdEstacion} value={est.IdEstacion}>
                    {est.Nombre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Min"
                size="small"
                sx={{ width: 60 }}
                value={paso.TiempoEstimadoMinutos}
                onChange={(e) => modificarPaso(setPasosNuevo, index, "TiempoEstimadoMinutos", e.target.value)}
              />
              <IconButton color="error" onClick={() => handleRemoverPasoNuevo(index)}><RemoveIcon /></IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={() => agregarPaso(setPasosNuevo)}>Agregar Paso</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button onClick={handleCrearProceso} variant="contained" sx={{ bgcolor: "#FF8C00" }} disabled={guardandoNuevo}>
            {guardandoNuevo ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}