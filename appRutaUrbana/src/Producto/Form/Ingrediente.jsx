import * as React from "react";
import { useState, useEffect } from "react";
import IngredienteService from "../../services/IngredienteService";

import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import toast from "react-hot-toast";

export default function ListIngredientesAdmin() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState(null);

  useEffect(() => {
    cargarIngredientes();
  }, []);

  const cargarIngredientes = () => {
    IngredienteService.getIngredientes()
      .then((response) => {
        setData(response.data || []);
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudieron cargar los ingredientes.");
      });
  };

  const handleEdit = (ingrediente) => {
    if (ingrediente) {
      setIngredienteSeleccionado({ ...ingrediente });
    } else {
      setIngredienteSeleccionado({
        Nombre: "",
      });
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIngredienteSeleccionado(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este ingrediente?")) return;

    try {
      await IngredienteService.delete(id);

      toast.success("Ingrediente eliminado correctamente.");

      cargarIngredientes();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.result || "No se pudo eliminar el ingrediente.",
      );
    }
  };

  const handleSave = async () => {
    if (!ingredienteSeleccionado?.Nombre.trim()) {
      toast("Debe ingresar el nombre del ingrediente.", {
        icon: "⚠️",
      });
      return;
    }

    try {
      if (ingredienteSeleccionado.IdIngrediente) {
        await IngredienteService.update(
          ingredienteSeleccionado.IdIngrediente,
          ingredienteSeleccionado,
        );

        toast.success("Ingrediente actualizado correctamente.");
      } else {
        await IngredienteService.create(ingredienteSeleccionado);

        toast.success("Ingrediente creado correctamente.");
      }

      handleClose();
      cargarIngredientes();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.result ||
          error.response?.data?.message ||
          "Ocurrió un error al guardar el ingrediente.",
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h3"
        align="center"
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        Gestión de Ingredientes
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleEdit(null)}
          sx={{
            bgcolor: "#FF8C00",
            "&:hover": {
              bgcolor: "#E67E00",
            },
          }}
        >
          Nuevo Ingrediente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>ID</b>
              </TableCell>

              <TableCell>
                <b>Ingrediente</b>
              </TableCell>

              <TableCell align="center">
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((ingrediente) => (
              <TableRow key={ingrediente.IdIngrediente}>
                <TableCell>{ingrediente.IdIngrediente}</TableCell>

                <TableCell>{ingrediente.Nombre}</TableCell>

                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(ingrediente)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(ingrediente.IdIngrediente)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {ingredienteSeleccionado?.IdIngrediente
            ? "Editar Ingrediente"
            : "Nuevo Ingrediente"}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nombre del ingrediente"
            value={ingredienteSeleccionado?.Nombre || ""}
            onChange={(e) =>
              setIngredienteSeleccionado({
                ...ingredienteSeleccionado,
                Nombre: e.target.value,
              })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: "#FF8C00",
              "&:hover": {
                bgcolor: "#E67E00",
              },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
