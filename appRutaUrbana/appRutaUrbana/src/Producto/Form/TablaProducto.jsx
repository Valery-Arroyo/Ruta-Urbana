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
        setProductos(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Administración de Productos
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          overflowX: "auto",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f2f2f2" }}>
              <TableCell sx={{ fontWeight: 600, fontSize: "15px" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "15px" }}>
                Nombre
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "15px" }}>
                Descripción
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "15px" }}>
                Precio
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "15px" }}>
                Estado
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, fontSize: "15px", width: 140 }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productos.map((p) => (
              <TableRow
                key={p.IdProducto}
                hover
                sx={{
                  "& td": {
                    py: 1,
                    fontSize: "14.5px", // 👈 aquí sube todo el texto
                  },
                }}
              >
                <TableCell>{p.IdProducto}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{p.Nombre}</TableCell>
                <TableCell sx={{ color: "text.secondary" }}>
                  {p.Descripcion}
                </TableCell>
                <TableCell>₡{p.Precio}</TableCell>

                <TableCell>
                  <Chip
                    label={p.Activo === "1" ? "Activo" : "Inactivo"}
                    color={p.Activo === "1" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton size="small" sx={{ color: "#000" }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>

                  <IconButton size="small" sx={{ color: "#333" }}>
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton size="small" sx={{ color: "#000" }}>
                    <DeleteIcon fontSize="small" />
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
