import * as React from "react";
import { useEffect, useState } from "react";
import ProductoService from "../../services/ProductoService";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TablaProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductoService.getProductos()
      .then((response) => {
        console.log("PRODUCTOS:", response.data);
        setProductos(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando productos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Administración de Productos
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.IdProducto} hover>
                <TableCell>{p.IdProducto}</TableCell>
                <TableCell>{p.Nombre}</TableCell>
                <TableCell>{p.Descripcion}</TableCell>
                <TableCell>₡{p.Precio}</TableCell>

                <TableCell>
                  <Chip
                    label={p.Activo === "1" ? "Activo" : "Inactivo"}
                    color={p.Activo === "1" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton color="primary">
                    <VisibilityIcon />
                  </IconButton>

                  <IconButton color="warning">
                    <EditIcon />
                  </IconButton>

                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}