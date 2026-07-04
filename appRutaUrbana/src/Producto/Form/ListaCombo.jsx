import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ComboService from "../../services/ComboService";
import {
  Card, CardMedia, CardContent, CardActions, Typography, Box, Button,
  IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import AddIcon from "@mui/icons-material/Add";

export default function ListCombosAdmin() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);

  useEffect(() => {
    cargarCombos();
  }, []);

  const cargarCombos = () => {
    ComboService.getCombos().then((response) => {
      const raw = response.data || [];
      const agrupado = raw.reduce((acc, item) => {
        let combo = acc.find((c) => c.IdCombo === item.IdCombo);
        if (!combo) {
          combo = { ...item, productos: [] };
          acc.push(combo);
        }
        return acc;
      }, []);
      setData(agrupado);
    });
  };

  const handleEdit = (combo) => {
    // Inicializamos el estado con 'Nombre' para que coincida con el backend
    setComboSeleccionado(combo ? { ...combo, Nombre: combo.NombreCombo } : { Nombre: "", Descripcion: "", PrecioEspecial: "" });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este combo?")) {
      try {
        await ComboService.deleteCombo(id);
        cargarCombos();
      } catch (error) {
        alert("Error al eliminar el combo.");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (comboSeleccionado.IdCombo) {
        await ComboService.updateCombo(comboSeleccionado.IdCombo, comboSeleccionado);
      } else {
        await ComboService.createCombo(comboSeleccionado);
      }
      setOpen(false);
      cargarCombos();
    } catch (error) {
      alert("Error al guardar el combo.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ mb: 2, fontWeight: "bold" }}>
        Gestión de Combos
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleEdit(null)} sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#E67E00" } }}>
          Nuevo Combo
        </Button>
      </Box>

      <Box sx={{
        display: 'grid',
        gap: 4,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
      }}>
        {data.map((combo) => (
          <Card key={combo.IdCombo} sx={{ 
            display: "flex", 
            flexDirection: "column", 
            width: "100%", 
            borderRadius: 4,
            height: "450px",
            boxShadow: "0 4px 12px rgba(0,0,0,.1)",
            transition: "0.3s",
            "&:hover": { transform: "translateY(-8px)", boxShadow: "0 16px 28px rgba(0,0,0,.18)" }
          }}>
            <CardMedia 
              component="img" 
              height="200" 
              image={`http://localhost:81/apirutaurbana/${combo.RutaImagen}`} 
              alt={combo.NombreCombo}
              sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pb: 0 }}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                {combo.NombreCombo}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ flexGrow: 1, overflow: 'hidden' }}>
                {combo.Descripcion}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
              <IconButton sx={{ color: "#FF8C00" }} onClick={() => navigate(`/combos/${combo.IdCombo}`)}>
                <ZoomInIcon />
              </IconButton>
              <IconButton color="primary" onClick={() => handleEdit(combo)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleDelete(combo.IdCombo)}>
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{comboSeleccionado?.IdCombo ? "Editar Combo" : "Nuevo Combo"}</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth margin="dense" label="Nombre" 
            value={comboSeleccionado?.Nombre || ""} 
            onChange={(e) => setComboSeleccionado({ ...comboSeleccionado, Nombre: e.target.value })} 
          />
          <TextField 
            fullWidth margin="dense" label="Precio" type="number" 
            value={comboSeleccionado?.PrecioEspecial || ""} 
            onChange={(e) => setComboSeleccionado({ ...comboSeleccionado, PrecioEspecial: e.target.value })} 
          />
          <TextField 
            fullWidth margin="dense" label="Descripción" multiline rows={3} 
            value={comboSeleccionado?.Descripcion || ""} 
            onChange={(e) => setComboSeleccionado({ ...comboSeleccionado, Descripcion: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#FF8C00" }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}