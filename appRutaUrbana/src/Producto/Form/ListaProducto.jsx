import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import {
  Card, CardMedia, CardContent, CardActions, Typography, Box, Button,
  IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import AddIcon from "@mui/icons-material/Add";

export default function ListProductos() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    ProductoService.getProductos().then((response) => {
      setData(response.data || []);
    });
  };

  const handleEdit = (producto) => {
    setProductoSeleccionado(producto || { Nombre: "", Descripcion: "", Precio: "" });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este producto?")) {
      try {
        await ProductoService.deleteProducto(id);
        cargarProductos();
      } catch (error) {
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
      alert("Error al guardar el producto.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ mb: 2, fontWeight: "bold" }}>
        Gestión de Productos
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleEdit(null)} sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#E67E00" } }}>
          Nuevo Producto
        </Button>
      </Box>

      <Box sx={{
        display: 'grid',
        gap: 4,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
      }}>
        {data.map((prod) => (
          <Card key={prod.IdProducto} sx={{ 
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
              // Accedemos a prod.Imagen si existe, si no, buscamos en el array ProductoImagen como en detalle
              image={`http://localhost:81/apirutaurbana/${prod.Imagen || (prod.ProductoImagen?.[0]?.Imagen || "")}`} 
              alt={prod.Nombre}
              sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pb: 0 }}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                {prod.Nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ flexGrow: 1, overflow: 'hidden' }}>
                {prod.Descripcion}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
              <IconButton sx={{ color: "#FF8C00" }} onClick={() => navigate(`/productos/${prod.IdProducto}`)}>
                <ZoomInIcon />
              </IconButton>
              <IconButton color="primary" onClick={() => handleEdit(prod)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleDelete(prod.IdProducto)}>
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{productoSeleccionado?.IdProducto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth margin="dense" label="Nombre" 
            value={productoSeleccionado?.Nombre || ""} 
            onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, Nombre: e.target.value })} 
          />
          <TextField 
            fullWidth margin="dense" label="Precio" type="number" 
            value={productoSeleccionado?.Precio || ""} 
            onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, Precio: e.target.value })} 
          />
          <TextField 
            fullWidth margin="dense" label="Descripción" multiline rows={3} 
            value={productoSeleccionado?.Descripcion || ""} 
            onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, Descripcion: e.target.value })} 
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