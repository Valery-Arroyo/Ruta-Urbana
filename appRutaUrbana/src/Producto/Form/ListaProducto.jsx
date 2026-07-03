import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import {
  Card, CardMedia, CardContent, CardActions, Typography, Grid, Box, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

export default function ListProductosAdmin() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    ProductoService.getProductos().then((response) => {
      setData(response.data);
    });
  };

  const handleEdit = (producto) => {
    setProductoSeleccionado(producto);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        const response = await ProductoService.deleteProducto(id);
        
        // Verificamos si el backend realmente tuvo éxito antes de quitarlo de la vista
        // Ajusta 'response.data.success' según cómo venga el objeto de respuesta de tu API
        if (response.data && response.data.success == 1) {
          setData((prevData) => prevData.filter((item) => String(item.IdProducto) !== String(id)));
        } else {
          alert("El servidor reportó un error al intentar eliminar.");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el producto.");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (productoSeleccionado.IdProducto) {
        await ProductoService.updateProducto(productoSeleccionado.IdProducto, productoSeleccionado);
      } else {
        await ProductoService.createProducto(productoSeleccionado);
      }
      setOpen(false);
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el producto.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Gestión de Productos
      </Typography>

      <Grid container spacing={4} alignItems="stretch">
        {data.map((row) => (
          <Grid key={row.IdProducto} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
            <Card sx={{ 
              width: "100%", 
              height: "400px", 
              display: "flex", 
              flexDirection: "column", 
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <CardMedia 
                component="img" 
                image={`http://localhost:81/apirutaurbana/${row.Imagen}`} 
                alt={row.Nombre} 
                sx={{ height: "200px", width: "100%", objectFit: "cover", flexShrink: 0 }} 
              />
              <CardContent sx={{ height: "120px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="h6" align="center" sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.Nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {row.NombreCategoria}
                </Typography>
              </CardContent>
              <CardActions sx={{ height: "80px", justifyContent: "center" }}>
                <IconButton sx={{ color: "#FF8C00" }} onClick={() => navigate(`/productos/${row.IdProducto}`)}>
                  <ZoomInIcon />
                </IconButton>
                <IconButton color="primary" onClick={() => handleEdit(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(row.IdProducto)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{productoSeleccionado?.IdProducto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Nombre" value={productoSeleccionado?.Nombre || ""} onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, Nombre: e.target.value })} />
          <TextField fullWidth margin="dense" label="Categoría" value={productoSeleccionado?.NombreCategoria || ""} onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, NombreCategoria: e.target.value })} />
          <TextField fullWidth margin="dense" label="Descripción" value={productoSeleccionado?.Descripcion || ""} onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, Descripcion: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#FF8C00" }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}