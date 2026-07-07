import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

// Esquema de validación con Yup
const productoSchema = yup.object().shape({
  Nombre: yup.string().required("El nombre es requerido"),
  Precio: yup
    .number()
    .typeError("Debe ser un número")
    .positive("Debe ser positivo")
    .required("El precio es requerido"),
  Descripcion: yup.string().required("La descripción es requerida"),
});

export default function GestionProductos() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productoSchema),
    defaultValues: {
      Nombre: "",
      Precio: "",
      Descripcion: "",
    },
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();
      console.log("===== PRODUCTOS RECIBIDOS =====");
      console.log(response.data);

      const productos = response.data || [];

      console.log(
        "IDs:",
        productos.map((p) => p.IdProducto),
      );

      const ids = productos.map((p) => p.IdProducto);
      const repetidos = ids.filter((id, index) => ids.indexOf(id) !== index);

      if (repetidos.length > 0) {
        console.warn("IDs repetidos encontrados:");
        console.warn(repetidos);
      } else {
        console.log("No hay IDs repetidos.");
      }

      // Eliminar duplicados temporalmente
      const productosUnicos = Array.from(
        new Map(productos.map((p) => [p.IdProducto, p])).values(),
      );

      console.log("PRODUCTOS ÚNICOS:");
      console.table(productosUnicos);

      setData(productosUnicos);
    } catch (error) {
      console.error("Error al cargar productos", error);
      toast.error("No fue posible cargar los productos");
    }
  };

  const handleEdit = (producto) => {
    if (producto) {
      setProductoSeleccionado(producto);
      reset(producto);
    } else {
      setProductoSeleccionado(null);
      reset({
        Nombre: "",
        Precio: "",
        Descripcion: "",
      });
    }

    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) return;

    try {
      console.log("Eliminar producto:", id);
      await ProductoService.deleteProducto(id);
      toast.success("Producto eliminado correctamente");
      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar el producto", error);
      toast.error("Error al eliminar el producto");
    }
  };

  const handleSave = async (formData) => {
    console.log("Formulario enviado:", formData);
    try {
      if (productoSeleccionado?.IdProducto) {
        console.log("Actualizando producto:", productoSeleccionado.IdProducto);
        await ProductoService.updateProducto(
          productoSeleccionado.IdProducto,
          formData,
        );
        toast.success("Producto actualizado correctamente");
      } else {
        console.log("Creando producto");
        await ProductoService.createProducto(formData);
        toast.success("Producto creado correctamente");
      }
      setOpen(false);
      reset({
        Nombre: "",
        Precio: "",
        Descripcion: "",
      });
      setProductoSeleccionado(null);
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto", error);
      toast.error("Error al guardar el producto");
    }
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Gestión de Productos
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 4,
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
          Nuevo Producto
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          justifyContent: "center",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 320px)",
            md: "repeat(3, 320px)",
            lg: "repeat(4, 320px)",
          },
        }}
      >
        {data.length === 0 ? (
          <Typography
            sx={{
              gridColumn: "1/-1",
              textAlign: "center",
              fontSize: "1.2rem",
            }}
          >
            No hay productos registrados.
          </Typography>
        ) : (
          data.map((prod) => (
            <Card
              key={prod.IdProducto}
              sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,.12)",
                transition: ".3s",

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,.18)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="170"
                image={`http://localhost:81/apirutaurbana/${
                  prod.Imagen || prod.ProductoImagen?.[0]?.Imagen || ""
                }`}
                alt={prod.Nombre}
                sx={{
                  objectFit: "cover",
                }}
              />

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  py: 2,
                  px: 2,
                }}
              >
                <Typography
                  align="center"
                  sx={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {prod.Nombre}
                </Typography>

                <Typography
                  align="center"
                  sx={{
                    fontSize: "1rem",
                    color: "text.secondary",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {prod.Descripcion}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: "center",
                  gap: 1,
                  pt: 0,
                  pb: 2,
                }}
              >
                <IconButton
                  sx={{ color: "#FF8C00" }}
                  onClick={() => navigate(`/productos/${prod.IdProducto}`)}
                >
                  <ZoomInIcon />
                </IconButton>

                <IconButton color="primary" onClick={() => handleEdit(prod)}>
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => handleDelete(prod.IdProducto)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {productoSeleccionado?.IdProducto
            ? "Editar Producto"
            : "Nuevo Producto"}
        </DialogTitle>

        <DialogContent>
          <Controller
            name="Nombre"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                fullWidth
                label="Nombre"
                error={!!errors.Nombre}
                helperText={errors.Nombre?.message}
              />
            )}
          />

          <Controller
            name="Precio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                fullWidth
                type="number"
                label="Precio"
                error={!!errors.Precio}
                helperText={errors.Precio?.message}
              />
            )}
          />

          <Controller
            name="Descripcion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                error={!!errors.Descripcion}
                helperText={errors.Descripcion?.message}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>

          <Button
            variant="contained"
            onClick={handleSubmit(handleSave)}
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
