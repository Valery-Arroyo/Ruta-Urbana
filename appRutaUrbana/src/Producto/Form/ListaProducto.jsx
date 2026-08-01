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
import { useTranslation } from "react-i18next";

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
    .transform((value) => value?.trim())
    .required("El nombre es requerido")
    .min(3, "Debe tener mínimo 3 caracteres")
    .max(100, "Debe tener máximo 100 caracteres"),

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

  Ingredientes: yup
    .array()
    .of(yup.number())
    .min(1, "Debe agregar al menos un ingrediente")
    .required("Debe agregar al menos un ingrediente"),

  Imagen: yup.string().nullable(),
});

export default function GestionProductos() {
  const { t, i18n } = useTranslation();

  const [data, setData] = useState([]);
  const [productoDelDiaId, setProductoDelDiaId] = useState(null);
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
      IdCategoria: "",
      Ingredientes: [],
      Imagen: "",
      Activo: 1,
    },
  });

  // Ingredientes guardados en el formulario
  const ingredientesAgregados = watch("Ingredientes");

  useEffect(() => {
    cargarProductos();
    cargarProductoDelDia();
    cargarIngredientes();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();

      setData(response.data || []);
    } catch (error) {
      console.error("Error cargando productos", error);

      toast.error(t("products.messages.loadError"));
    }
  };

  /*
   * Consulta el endpoint que valida la fecha en el servidor
   * (CURDATE()) y, si es necesario, elige un nuevo producto del
   * día ahí mismo. Se usa el IdProducto que devuelve, en vez del
   * flag EsProductoDelDia que viene con la lista completa, porque
   * ese flag puede quedar desactualizado de un día para otro.
   */
  const cargarProductoDelDia = async () => {
    try {
      const response = await ProductoService.getProductoDelDia();

      setProductoDelDiaId(response.data?.IdProducto ?? null);
    } catch (error) {
      console.error("Error cargando producto del día", error);
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
      // Validar que al crear se ingrese una ruta de imagen
      if (
        !productoSeleccionado?.IdProducto &&
        (!formData.Imagen || formData.Imagen.trim() === "")
      ) {
        toast.error(t("products.messages.imageRequired"));
        return;
      }

      if (productoSeleccionado?.IdProducto) {
        await ProductoService.update(productoSeleccionado.IdProducto, formData);

        toast.success(t("products.messages.updated"));
      } else {
        await ProductoService.create(formData);

        toast.success(t("products.messages.created"));
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
      console.error("Respuesta del backend:", error.response?.data);

      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.result ||
        t("products.messages.saveError");

      toast.error(mensaje);
    }
  };

  const confirmarEliminar = (producto) => {
    setProductoEliminar(producto);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await ProductoService.delete(productoEliminar.IdProducto);

      toast.success(t("products.messages.deleted"));

      setOpenDelete(false);
      setProductoEliminar(null);

      cargarProductos();
    } catch (error) {
      console.error("Error eliminando producto", error);

      toast.error(t("products.messages.deleteError"));
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
        {t("products.title")}
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
          {t("products.new")}
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
            {t("products.noProducts")}
          </Typography>
        ) : (
          data.map((prod) => {
            /*
             * Se compara contra el IdProducto que devolvió el
             * endpoint productoDelDia (que valida la fecha en el
             * servidor), no contra el flag EsProductoDelDia de esta
             * lista, que puede quedar desactualizado de un día
             * para otro.
             */
            const esProductoDelDia =
              productoDelDiaId !== null &&
              Number(prod.IdProducto) === Number(productoDelDiaId);

            return (
              <Card
                key={prod.IdProducto}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",

                  bgcolor: esProductoDelDia ? "#111111" : "#FFFFFF",

                  color: esProductoDelDia ? "#FFFFFF" : "inherit",

                  border: esProductoDelDia
                    ? "3px solid #FF8C00"
                    : "1px solid transparent",

                  boxShadow: esProductoDelDia
                    ? "0 8px 28px rgba(255, 140, 0, 0.45)"
                    : "0 4px 12px rgba(0,0,0,.12)",

                  transform: esProductoDelDia ? "translateY(-4px)" : "none",

                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease",

                  "&:hover": {
                    transform: esProductoDelDia
                      ? "translateY(-8px)"
                      : "translateY(-4px)",

                    boxShadow: esProductoDelDia
                      ? "0 12px 35px rgba(255, 140, 0, 0.6)"
                      : "0 8px 20px rgba(0,0,0,.18)",
                  },
                }}
              >
                {esProductoDelDia && (
                  <Box
                    sx={{
                      bgcolor: "#000000",
                      color: "#FF8C00",
                      textAlign: "center",
                      py: 1.2,
                      px: 1,
                      fontWeight: "bold",
                      letterSpacing: "0.12rem",
                      fontSize: "0.9rem",
                      borderBottom: "1px solid rgba(255,140,0,.45)",
                    }}
                  >
                    ⭐ {t("products.productOfTheDay")} ⭐
                  </Box>
                )}

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
                      color: esProductoDelDia ? "#FFFFFF" : "text.primary",
                    }}
                  >
                    {prod.Nombre}
                  </Typography>

                  <Typography
                    align="center"
                    sx={{
                      color: esProductoDelDia
                        ? "rgba(255,255,255,.75)"
                        : "text.secondary",

                      mt: 0.5,
                    }}
                  >
                    {prod.Descripcion}
                  </Typography>

                  <Typography
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: "#FF8C00",
                      mt: 1,
                      fontSize: esProductoDelDia ? "1.25rem" : "1rem",
                    }}
                  >
                    ₡
                    {Number(prod.Precio).toLocaleString(
                      i18n.language === "en" ? "en-US" : "es-CR",
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      },
                    )}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{
                    justifyContent: "center",

                    borderTop: esProductoDelDia
                      ? "1px solid rgba(255,255,255,.12)"
                      : "none",
                  }}
                >
                  <IconButton
                    aria-label={`${t("actions.view")} ${prod.Nombre}`}
                    sx={{
                      color: "#FF8C00",

                      "&:hover": {
                        bgcolor: esProductoDelDia
                          ? "rgba(255,140,0,.15)"
                          : "rgba(255,140,0,.1)",
                      },
                    }}
                    onClick={() => navigate(`/productos/${prod.IdProducto}`)}
                  >
                    <ZoomInIcon />
                  </IconButton>

                  <IconButton
                    aria-label={`${t("actions.edit")} ${prod.Nombre}`}
                    onClick={() => handleEdit(prod)}
                    sx={{
                      color: esProductoDelDia ? "#FFFFFF" : "inherit",

                      "&:hover": {
                        bgcolor: esProductoDelDia
                          ? "rgba(255,255,255,.12)"
                          : "rgba(0,0,0,.04)",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    aria-label={`${t("actions.delete")} ${prod.Nombre}`}
                    color="error"
                    onClick={() => confirmarEliminar(prod)}
                    sx={{
                      "&:hover": {
                        bgcolor: esProductoDelDia
                          ? "rgba(211,47,47,.18)"
                          : "rgba(211,47,47,.08)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            );
          })
        )}

        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>{t("products.confirmDeleteTitle")}</DialogTitle>

          <DialogContent>
            <Typography>
              {t("products.confirmDeleteMessage")}:
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
              {t("actions.cancel")}
            </Button>

            <Button variant="contained" color="error" onClick={handleDelete}>
              {t("actions.delete")}
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
            ? t("products.edit")
            : t("products.new")}
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
                label={t("fields.name")}
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
                label={t("fields.price")}
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
                label={t("fields.description")}
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
                label={t("fields.category")}
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
            {t("fields.ingredients")}
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
              label={t("products.selectIngredient")}
              value={ingredienteSeleccionado}
              onChange={(event) => {
                setIngredienteSeleccionado(event.target.value);
                setErrorIngrediente("");
              }}
              error={!!errorIngrediente}
              helperText={errorIngrediente}
            >
              <MenuItem value="">
                <em>{t("products.chooseIngredient")}</em>
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
                  setErrorIngrediente(t("products.messages.selectIngredient"));

                  return;
                }

                const actuales = ingredientesAgregados || [];
                const nuevo = Number(ingredienteSeleccionado);

                if (actuales.some((id) => Number(id) === nuevo)) {
                  toast.error(t("products.messages.duplicateIngredient"));

                  return;
                }

                setValue("Ingredientes", [...actuales, nuevo], {
                  shouldValidate: true,
                });

                setIngredienteSeleccionado("");
                setErrorIngrediente("");
              }}
            >
              {t("actions.add")}
            </Button>
          </Box>

          {errors.Ingredientes && (
            <Typography
              color="error"
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
              }}
            >
              {errors.Ingredientes.message}
            </Typography>
          )}

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

                      setValue("Ingredientes", nuevos, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    {t("actions.delete")}
                  </Button>
                </Box>
              );
            })}
          </Box>

          <Controller
            name="Imagen"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label={t("products.imagePath")}
                placeholder="imagenes/hamburguesa.jpg"
                helperText={
                  productoSeleccionado
                    ? t("products.keepCurrentImage")
                    : t("products.enterImagePath")
                }
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>

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
            {productoSeleccionado?.IdProducto
              ? t("actions.update")
              : t("actions.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
