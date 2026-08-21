import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import IngredienteService from "../../services/IngredienteService";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

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
  const { t } = useTranslation();
  const { rol } = useAuth();
  const esAdministrador = rol === ROLES.ADMINISTRADOR;
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
        toast.error(t("ingredientsPage.messages.loadError"));
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
    if (!window.confirm(t("ingredientsPage.confirmDelete"))) return;

    try {
      await IngredienteService.delete(id);

      toast.success(t("ingredientsPage.messages.deleted"));

      cargarIngredientes();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.result || t("ingredientsPage.messages.deleteError"),
      );
    }
  };

  const handleSave = async () => {
    if (!ingredienteSeleccionado?.Nombre.trim()) {
      toast(t("ingredientsPage.messages.nameRequired"), {
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

        toast.success(t("ingredientsPage.messages.updated"));
      } else {
        await IngredienteService.create(ingredienteSeleccionado);

        toast.success(t("ingredientsPage.messages.created"));
      }

      handleClose();
      cargarIngredientes();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.result ||
          error.response?.data?.message ||
          t("ingredientsPage.messages.saveError"),
      );
    }
  };

  if (!esAdministrador) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>{t("access.onlyAdministrator")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h3"
        align="center"
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        {t("ingredientsPage.title")}
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
          {t("ingredientsPage.new")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>{t("ingredientsPage.columnId")}</b>
              </TableCell>

              <TableCell>
                <b>{t("ingredientsPage.columnName")}</b>
              </TableCell>

              <TableCell align="center">
                <b>{t("ingredientsPage.columnActions")}</b>
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
            ? t("ingredientsPage.edit")
            : t("ingredientsPage.new")}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={t("ingredientsPage.nameLabel")}
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
          <Button onClick={handleClose}>{t("actions.cancel")}</Button>

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
            {t("actions.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
