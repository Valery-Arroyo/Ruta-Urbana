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
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";

import ProductoService from "../../services/ProductoService";
import IngredienteService from "../../services/IngredienteService";

import { useForm, Controller } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";

import toast from "react-hot-toast";

// Validación
const productoSchema = yup.object().shape({
  Nombre: yup.string().required("El nombre es requerido"),

  Precio: yup
    .number()
    .typeError("Debe ser un número")
    .positive("Debe ser positivo")
    .required("El precio es requerido"),

  Descripcion: yup.string().required("La descripción es requerida"),

  IdCategoria: yup.number().required("La categoría es requerida"),
});

export default function GestionProductos() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
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
      Imagen: "",
      Ingredientes: [],
      IdCategoria: "",
    },
  });

  useEffect(() => {
    cargarProductos();
    cargarIngredientes();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();
      setData(response.data || []);
    } catch (error) {
      console.error("Error cargando productos", error);

      toast.error("No fue posible cargar productos");
    }
  };

  const cargarIngredientes = async () => {
    try {
      const response = await IngredienteService.getIngredientes();
      setIngredientes(response.data || []);
    } catch (error) {
      console.error("Error cargando ingredientes", error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await ProductoService.getCategorias();
      setCategorias(response.data || []);
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };

  const handleEdit = (producto) => {
    if (producto) {
      setProductoSeleccionado(producto);
      reset({
        Nombre: producto.Nombre,
        Precio: producto.Precio,
        Descripcion: producto.Descripcion,
        Imagen: producto.Imagen || "",
        IdCategoria: producto.IdCategoria || "",

        Ingredientes: producto.Ingredientes
          ? producto.Ingredientes.map((i) => i.IdIngrediente)
          : [],
      });
    } else {
      setProductoSeleccionado(null);
      reset({
        Nombre: "",
        Precio: "",
        Descripcion: "",
        Imagen: "",
        IdCategoria: "",
        Ingredientes: [],
      });
    }

    setOpen(true);
  };
  const handleSave = async (formData) => {
    try {
      console.log("Datos enviados:", formData);

      if (productoSeleccionado?.IdProducto) {
        await ProductoService.updateProducto(
          productoSeleccionado.IdProducto,
          formData,
        );

        toast.success("Producto actualizado correctamente");
      } else {
        await ProductoService.createProducto(formData);

        toast.success("Producto creado correctamente");
      }

      setOpen(false);

      setProductoSeleccionado(null);

      reset({
        Nombre: "",
        Precio: "",
        Descripcion: "",
        Imagen: "",
        IdCategoria: "",
        Ingredientes: [],
      });

      cargarProductos();
    } catch (error) {
      console.error("Error guardando producto", error);

      toast.error("Error al guardar producto");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) return;

    try {
      await ProductoService.deleteProducto(id);

      toast.success("Producto eliminado correctamente");

      cargarProductos();
    } catch (error) {
      console.error("Error eliminando producto", error);

      toast.error("Error al eliminar producto");
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

            sm: "repeat(2,320px)",

            md: "repeat(3,320px)",

            lg: "repeat(4,320px)",
          },
        }}
      >
        {data.length === 0 ? (
          <Typography
            sx={{
              gridColumn: "1/-1",

              textAlign: "center",
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
              }}
            >
              <CardMedia
                component="img"
                height="170"
                image={
                  prod.Imagenes
                    ? `http://localhost:81/apirutaurbana/${prod.Imagenes.split(",")[0]}`
                    : "/no-image.png"
                }
                alt={prod.Nombre}
                sx={{
                  objectFit: "cover",
                }}
              />

              <CardContent
                sx={{
                  flexGrow: 1,
                }}
              >
                <Typography
                  align="center"
                  sx={{
                    fontWeight: "bold",

                    fontSize: "1.3rem",
                  }}
                >
                  {prod.Nombre}
                </Typography>

                <Typography align="center" color="text.secondary">
                  {prod.Descripcion}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: "center",
                }}
              >
                <IconButton
                  sx={{
                    color: "#FF8C00",
                  }}
                  onClick={() => navigate(`/productos/${prod.IdProducto}`)}
                >
                  <ZoomInIcon />
                </IconButton>

                <IconButton onClick={() => handleEdit(prod)}>
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
          {/* Nombre */}

          <Controller
            name="Nombre"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label="Nombre"
                error={!!errors.Nombre}
                helperText={errors.Nombre?.message}
              />
            )}
          />

          {/* Precio */}

          <Controller
            name="Precio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                type="number"
                label="Precio"
                error={!!errors.Precio}
                helperText={errors.Precio?.message}
              />
            )}
          />

          {/* Descripción */}

          <Controller
            name="Descripcion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                multiline
                rows={3}
                label="Descripción"
                error={!!errors.Descripcion}
                helperText={errors.Descripcion?.message}
              />
            )}
          />

          {/* Categoría */}

          <Controller
            name="IdCategoria"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                margin="dense"
                label="Categoría"
                error={!!errors.IdCategoria}
                helperText={errors.IdCategoria?.message}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.IdCategoria} value={cat.IdCategoria}>
                    {cat.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* Ingredientes */}

          <Controller
            name="Ingredientes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                SelectProps={{
                  multiple: true,
                }}
                fullWidth
                margin="dense"
                label="Ingredientes"
              >
                {ingredientes.map((ing) => (
                  <MenuItem key={ing.IdIngrediente} value={ing.IdIngrediente}>
                    {ing.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* Imagen */}

          <Controller
            name="Imagen"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label="Imagen"
                placeholder="ejemplo: hamburguesa.jpg"
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
