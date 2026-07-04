import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuService from "../../services/MenuService";
import {
  Card, CardContent, Typography, Grid, Box, Button, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function ListMenusAdmin() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openNuevo, setOpenNuevo] = useState(false);
  const [menuEditar, setMenuEditar] = useState(null);
  const [menuNuevo, setMenuNuevo] = useState({ Nombre: "", HoraInicio: "", HoraFin: "", DiasDisponibles: "" });
  const navigate = useNavigate();
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  useEffect(() => { cargarMenus(); }, []);

  const cargarMenus = () => {
    MenuService.getMenus().then((response) => {
      setMenus(response.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleCheckboxChange = (dia, state, setState) => {
    const currentDays = state.DiasDisponibles ? state.DiasDisponibles.split(", ").filter(d => d !== "") : [];
    let updatedDays;
    if (currentDays.includes(dia)) {
      updatedDays = currentDays.filter(d => d !== dia);
    } else {
      updatedDays = [...currentDays, dia];
    }
    setState({ ...state, DiasDisponibles: updatedDays.join(", ") });
  };

  const isDisponibleAhora = (menu) => {
    const ahora = new Date();
    if (String(menu.EstaActivo) !== "1") return false;
    const [hIni, mIni, sIni] = menu.HoraInicio.split(":").map(Number);
    const [hFin, mFin, sFin] = menu.HoraFin.split(":").map(Number);
    const horaInicio = new Date(ahora); horaInicio.setHours(hIni, mIni, sIni, 0);
    const horaFin = new Date(ahora); horaFin.setHours(hFin, mFin, sFin, 0);
    if (!(ahora >= horaInicio && ahora <= horaFin)) return false;
    const diaActual = diasSemana[ahora.getDay() === 0 ? 6 : ahora.getDay() - 1];
    if (menu.DiasDisponibles && menu.DiasDisponibles.trim() !== "") {
      return menu.DiasDisponibles.split(",").map((d) => d.trim()).includes(diaActual);
    }
    return true;
  };

  const handleCreate = async () => {
    const dataParaEnviar = {
      ...menuNuevo,
      Disponibilidad: menuNuevo.DiasDisponibles.split(", ").filter(d => d !== "").map(dia => ({ DiaSemana: dia }))
    };
    await MenuService.createMenu(dataParaEnviar);
    setOpenNuevo(false);
    setMenuNuevo({ Nombre: "", HoraInicio: "", HoraFin: "", DiasDisponibles: "" });
    cargarMenus();
  };

  const handleSave = async () => {
    await MenuService.updateMenu(menuEditar.IdMenu, menuEditar);
    setOpen(false);
    cargarMenus();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar menú?")) {
      await MenuService.deleteMenu(id);
      cargarMenus();
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: "bold" }}>Gestión de Menús</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNuevo(true)} sx={{ bgcolor: "#FF8C00" }}>Nuevo Menú</Button>
      </Box>

      <Grid container spacing={3}>
        {menus.map((menu) => {
          const disponible = isDisponibleAhora(menu);
          return (
            <Grid key={menu.IdMenu} item xs={12} sm={6} md={4} sx={{ display: "flex" }}>
              <Card sx={{ 
                display: "flex", 
                flexDirection: "column", 
                width: "100%",
                borderRadius: 4, 
                boxShadow: "0 4px 12px rgba(0,0,0,.1)", 
                opacity: disponible ? 1 : 0.6, 
                filter: disponible ? "none" : "grayscale(0.5)" 
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">{menu.Nombre}</Typography>
                  <Typography variant="body2">Horario: {menu.HoraInicio} - {menu.HoraFin}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Días: {menu.DiasDisponibles || "Sin restricción"}</Typography>
                </CardContent>
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Button variant="contained" size="small" sx={{ bgcolor: disponible ? "#FF8C00" : "#ccc" }} disabled={!disponible} onClick={() => navigate(`/menu/${menu.IdMenu}`)}>
                    {disponible ? "Ver detalle" : "No disponible"}
                  </Button>
                  <Box>
                    <IconButton color="primary" onClick={() => { setMenuEditar({ ...menu }); setOpen(true); }}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(menu.IdMenu)}><DeleteIcon /></IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* DIALOG CREAR */}
      <Dialog open={openNuevo} onClose={() => setOpenNuevo(false)} fullWidth maxWidth="sm">
        <DialogTitle>Crear Nuevo Menú</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Nombre" value={menuNuevo.Nombre} onChange={(e) => setMenuNuevo({...menuNuevo, Nombre: e.target.value})} />
          <TextField fullWidth margin="dense" label="Hora Inicio (HH:MM:SS)" value={menuNuevo.HoraInicio} onChange={(e) => setMenuNuevo({...menuNuevo, HoraInicio: e.target.value})} />
          <TextField fullWidth margin="dense" label="Hora Fin (HH:MM:SS)" value={menuNuevo.HoraFin} onChange={(e) => setMenuNuevo({...menuNuevo, HoraFin: e.target.value})} />
          <Typography sx={{ mt: 2 }}>Días Disponibles:</Typography>
          {diasSemana.map(dia => (
            <FormControlLabel key={dia} control={<Checkbox checked={menuNuevo.DiasDisponibles.includes(dia)} onChange={() => handleCheckboxChange(dia, menuNuevo, setMenuNuevo)} />} label={dia} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNuevo(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG EDITAR */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Menú</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Nombre" value={menuEditar?.Nombre || ""} onChange={(e) => setMenuEditar({...menuEditar, Nombre: e.target.value})} />
          <TextField fullWidth margin="dense" label="Hora Inicio" value={menuEditar?.HoraInicio || ""} onChange={(e) => setMenuEditar({...menuEditar, HoraInicio: e.target.value})} />
          <TextField fullWidth margin="dense" label="Hora Fin" value={menuEditar?.HoraFin || ""} onChange={(e) => setMenuEditar({...menuEditar, HoraFin: e.target.value})} />
          <Typography sx={{ mt: 2 }}>Días Disponibles:</Typography>
          {diasSemana.map(dia => (
            <FormControlLabel key={dia} control={<Checkbox checked={menuEditar?.DiasDisponibles?.includes(dia) || false} onChange={() => handleCheckboxChange(dia, menuEditar, setMenuEditar)} />} label={dia} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar Cambios</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}