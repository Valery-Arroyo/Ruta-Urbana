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
import CategoriaService from "../../services/CategoriaService";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

const productoSchema = yup.object().shape({
  Nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(3, "Debe tener mínimo 3 caracteres"),

  Precio: yup
    .number()
    .typeError("Debe ser un número")
    .positive("Debe ser positivo")
    .required("El precio es requerido"),

  Descripcion: yup.string().required("La descripción es requerida"),

  IdCategoria: yup
    .number()
    .typeError("Seleccione una categoría")
    .required("La categoría es requerida"),

  Ingredientes: yup.array().min(1, "Seleccione al menos un ingrediente"),

  Imagen: yup.string().nullable(),
});

export default function GestionProductos() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [productoEliminar, setProductoEliminar] = useState(null);
  const [errorIngrediente, setErrorIngrediente] = useState("");
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,

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

  // Ingredientes guardados en el formulario
  const ingredientesAgregados = watch("Ingredientes");

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
      const response = await CategoriaService.getCategorias();

      setCategorias(response.data || []);
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };

  /*
   * Obtiene correctamente la URL de la imagen.
   * Acepta las propiedades Imagen e Imagenes.
   */
  const obtenerImagenProducto = (producto) => {
    const imagenGuardada = producto.Imagenes || producto.Imagen;

    if (!imagenGuardada) {
      return "/no-image.png";
    }

    const primeraImagen = String(imagenGuardada)
      .split(",")[0]
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    if (!primeraImagen) {
      return "/no-image.png";
    }

    if (
      primeraImagen.startsWith("http://") ||
      primeraImagen.startsWith("https://")
    ) {
      return primeraImagen;
    }

    return `http://localhost:81/apirutaurbana/${primeraImagen}`;
  };

  const handleEdit = (producto) => {
    if (producto) {
      setProductoSeleccionado(producto);

      reset({
        Nombre: producto.Nombre,
        Precio: producto.Precio,
        Descripcion: producto.Descripcion,

        Imagen:
          producto.Imagen ||
          (producto.Imagenes
            ? String(producto.Imagenes).split(",")[0].trim()
            : ""),

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
        await ProductoService.update(productoSeleccionado.IdProducto, formData);

        toast.success("Producto actualizado correctamente");
      } else {
        await ProductoService.create(formData);

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

  const confirmarEliminar = (producto) => {
    setProductoEliminar(producto);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await ProductoService.delete(productoEliminar.IdProducto);

      toast.success("Producto eliminado correctamente");

      setOpenDelete(false);
      setProductoEliminar(null);

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
                image={obtenerImagenProducto(prod)}
                alt={prod.Nombre}
                onError={(event) => {
                  console.error(
                    "No se pudo cargar la imagen:",
                    event.currentTarget.src,
                  );

                  console.log("Producto relacionado:", prod);

                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/no-image.png";
                }}
                sx={{
                  objectFit: "cover",
                  width: "100%",
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

                <Typography
                  align="center"
                  sx={{
                    fontWeight: "bold",

                    color: "#FF8C00",

                    mt: 1,
                  }}
                >
                  ₡{prod.Precio}
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
                  onClick={() => confirmarEliminar(prod)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))
        )}

        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Confirmar eliminación</DialogTitle>

          <DialogContent>
            <Typography>
              ¿Está seguro que desea eliminar el producto:
              <b> {productoEliminar?.Nombre}</b>?
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setOpenDelete(false);
                setProductoEliminar(null);
              }}
            >
              Cancelar
            </Button>

            <Button variant="contained" color="error" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
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
                fullWidth
                margin="dense"
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
                fullWidth
                margin="dense"
                type="number"
                label="Precio"
                slotProps={{
                  htmlInput: {
                    min: 0,

                    step: 0.01,
                  },
                }}
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

          <Typography
            sx={{
              mt: 2,

              mb: 1,

              fontWeight: "bold",
            }}
          >
            Ingredientes
          </Typography>

          <Box
            sx={{
              display: "flex",

              gap: 1,

              alignItems: "center",
            }}
          >
            <TextField
              select
              fullWidth
              label="Seleccionar ingrediente"
              value={ingredienteSeleccionado}
              onChange={(e) => {
                setIngredienteSeleccionado(e.target.value);
                setErrorIngrediente("");
              }}
              error={!!errorIngrediente}
              helperText={errorIngrediente}
            >
              <MenuItem value="">
                <em>Seleccione un ingrediente</em>
              </MenuItem>

              {ingredientes.map((ing) => (
                <MenuItem key={ing.IdIngrediente} value={ing.IdIngrediente}>
                  {ing.Nombre}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              sx={{
                bgcolor: "#FF8C00",

                height: "56px",

                "&:hover": {
                  bgcolor: "#E67E00",
                },
              }}
              onClick={() => {
                if (!ingredienteSeleccionado) {
                  setErrorIngrediente("Debe seleccionar un ingrediente");
                  return;
                }

                const actuales = ingredientesAgregados || [];
                const nuevo = Number(ingredienteSeleccionado);

                if (!actuales.some((id) => Number(id) === nuevo)) {
                  setValue("Ingredientes", [...actuales, nuevo], {
                    shouldValidate: true,
                  });
                }

                setIngredienteSeleccionado("");
                setErrorIngrediente("");
              }}
            >
              AGREGAR
            </Button>
          </Box>

          {/* Ingredientes agregados */}

          <Box sx={{ mt: 2 }}>
            {ingredientesAgregados?.map((id) => {
              const ingrediente = ingredientes.find(
                (i) => Number(i.IdIngrediente) === Number(id),
              );

              return (
                <Box
                  key={id}
                  sx={{
                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    mb: 1,

                    p: 1,

                    border: "1px solid #ddd",

                    borderRadius: 2,
                  }}
                >
                  <Typography>{ingrediente?.Nombre}</Typography>

                  <Button
                    color="error"
                    onClick={() => {
                      const nuevos = ingredientesAgregados.filter(
                        (x) => Number(x) !== Number(id),
                      );

                      setValue(
                        "Ingredientes",

                        nuevos,

                        {
                          shouldValidate: true,
                        },
                      );
                    }}
                  >
                    ELIMINAR
                  </Button>
                </Box>
              );
            })}
          </Box>

          {/* Imagen */}

          <Controller
            name="Imagen"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label="Ruta de imagen"
                placeholder="imagenes/hamburguesa.jpg"
                helperText={
                  productoSeleccionado
                    ? "Deje vacío para conservar la imagen actual"
                    : "Ingrese la ruta de la imagen"
                }
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