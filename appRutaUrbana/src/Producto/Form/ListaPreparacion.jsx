import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardActions, IconButton, Typography, Grid, Box, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, ZoomIn as ZoomInIcon, Add as AddIcon, RemoveCircle as RemoveIcon } from "@mui/icons-material";
import PreparacionService from "../../services/PreparacionService";
import EstacionService from "../../services/EstacionService";

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
  const [open, setOpen] = useState(false);
  const [procesoEdit, setProcesoEdit] = useState(null);
  const [pasosForm, setPasosForm] = useState([]);
  const [pasosEliminados, setPasosEliminados] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [estaciones, setEstaciones] = useState([]);

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

  useEffect(() => {
    cargarDatos();
    cargarEstaciones();
  }, []);

  const abrirEdicion = (item) => {
    setProcesoEdit(item);
    setPasosEliminados([]);
    // Copia profunda: nunca mutamos directamente los objetos de "data"
    setPasosForm(item.pasos.map(p => ({ ...p })));
    setOpen(true);
  };

  const handleCambiarPaso = (index, campo, valor) => {
    setPasosForm(prev => prev.map((p, i) => (i === index ? { ...p, [campo]: valor } : p)));
  };

  const handleRemoverPaso = (index) => {
    const paso = pasosForm[index];
    // Solo lo mandamos a borrar si YA existía en la BD (tiene IdProceso)
    if (paso?.IdProceso) {
      setPasosEliminados(prev => [...prev, paso.IdProceso]);
    }
    setPasosForm(prev => prev.filter((_, i) => i !== index));
  };

  const handleAgregarPaso = () => {
    setPasosForm(prev => [...prev, pasoVacio()]);
  };

  const handleSave = async () => {
    // Validación mínima
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

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Toaster />
      <Box sx={{ width: "100%", maxWidth: "1200px" }}>
        <Typography variant="h3" sx={{ mb: 4, fontWeight: "bold", color: "#FF8C00", textAlign: "center" }}>Procesos</Typography>
        <Grid container spacing={2}>
          {data.map((item, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card sx={{ p: 1.5, borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Typography sx={{ fontWeight: "bold" }}>{item.Nombre}</Typography>
                  <Chip label={`Pasos: ${item.pasos.length}`} size="small" color={item.esProducto ? "primary" : "success"} sx={{ mt: 1 }} />
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <IconButton onClick={() => abrirEdicion(item)} sx={orangeIcon}><EditIcon /></IconButton>
                  <IconButton sx={orangeIcon}><DeleteIcon /></IconButton>
                  <IconButton onClick={() => navigate(item.IdProducto ? `/preparacion/${item.IdProducto}` : `/preparacion/combo/${item.IdCombo}`)} sx={orangeIcon}><ZoomInIcon /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

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
                onChange={(e) => handleCambiarPaso(index, "OrdenPaso", e.target.value)}
              />
              <TextField
                select
                label="Estación"
                size="small"
                fullWidth
                value={paso.IdEstacion || ''}
                onChange={(e) => handleCambiarPaso(index, "IdEstacion", Number(e.target.value))}
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
                onChange={(e) => handleCambiarPaso(index, "TiempoEstimadoMinutos", e.target.value)}
              />
              <IconButton color="error" onClick={() => handleRemoverPaso(index)}><RemoveIcon /></IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={handleAgregarPaso}>Agregar Paso</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#FF8C00" }} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}