import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardActions, IconButton, Typography, Grid, Box, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, ZoomIn as ZoomInIcon, Add as AddIcon, RemoveCircle as RemoveIcon } from "@mui/icons-material";
import PreparacionService from "../../services/PreparacionService";

const orangeIcon = { color: "#FF8C00" };

const procesoSchema = yup.object().shape({
  pasos: yup.array().of(yup.object().shape({
    IdProceso: yup.number().nullable(),
    IdEstacion: yup.number().required(),
    OrdenPaso: yup.number().required(),
    NombreEstacion: yup.string().required(),
    TiempoEstimadoMinutos: yup.number().required(),
  })),
});

export default function ListPreparacionPublic() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [procesoEdit, setProcesoEdit] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(procesoSchema),
    defaultValues: { pasos: [] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "pasos" });

  const cargarDatos = async () => {
    try {
      const response = await PreparacionService.getPreparaciones();
      const agrupado = response.data.reduce((acc, item) => {
        const idProd = item.IdProducto || item.idProducto || item.idproducto;
        const idCombo = item.IdCombo || item.idCombo || item.idcombo;
        const key = idProd ? `prod-${idProd}` : `combo-${idCombo}`;
        if (!acc[key]) {
          acc[key] = { Nombre: item.NombreProducto || item.NombreCombo, IdProducto: idProd, IdCombo: idCombo, esProducto: !!idProd, pasos: [] };
        }
        acc[key].pasos.push({ 
            IdProceso: item.IdProceso, IdEstacion: Number(item.IdEstacion) || 0, 
            OrdenPaso: Number(item.OrdenPaso), NombreEstacion: item.NombreEstacion, 
            TiempoEstimadoMinutos: Number(item.TiempoEstimadoMinutos) 
        });
        return acc;
      }, {});
      setData(Object.values(agrupado));
    } catch (e) { toast.error("Error al cargar"); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSave = async (dataForm) => {
    try {
      // Enviamos el objeto p tal cual, asegurando números
      await Promise.all(dataForm.pasos.map(p => PreparacionService.updatePreparacion(p.IdProceso, {
          ...p,
          IdEstacion: Number(p.IdEstacion) || 0
      })));
      toast.success("Guardado correctamente");
      setOpen(false);
      cargarDatos();
    } catch (e) { toast.error("Error al guardar en BD"); }
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
                  <IconButton onClick={() => { setProcesoEdit(item); reset({ pasos: item.pasos }); setOpen(true); }} sx={orangeIcon}><EditIcon /></IconButton>
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
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2, mt: 1 }}>
              <Controller name={`pasos.${index}.OrdenPaso`} control={control} render={({ field }) => <TextField {...field} label="Ord" size="small" sx={{ width: 60 }} />} />
              <Controller name={`pasos.${index}.NombreEstacion`} control={control} render={({ field }) => <TextField {...field} label="Estación" size="small" fullWidth />} />
              <Controller name={`pasos.${index}.TiempoEstimadoMinutos`} control={control} render={({ field }) => <TextField {...field} label="Min" size="small" sx={{ width: 60 }} />} />
              <IconButton color="error" onClick={() => remove(index)}><RemoveIcon /></IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={() => append({ OrdenPaso: 0, NombreEstacion: '', TiempoEstimadoMinutos: 0, IdEstacion: 0 })}>Agregar Paso</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit(handleSave)} variant="contained" sx={{ bgcolor: "#FF8C00" }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}