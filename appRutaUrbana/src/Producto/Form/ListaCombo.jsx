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
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ComboService from "../../services/ComboService";
import ProductoService from "../../services/ProductoService";
import CategoriaService from "../../services/CategoriaService";

import toast from "react-hot-toast";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

// Schema de validación para el formulario de combos
const comboSchema = yup.object().shape({
  Nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(3, "Debe tener mínimo 3 caracteres"),

  PrecioEspecial: yup
    .number()
    .typeError("Debe ingresar un número")
    .positive("Debe ser positivo")
    .required("El precio es requerido"),

  Descripcion: yup
    .string()
    .trim()
    .required("La descripción es requerida")
    .min(3, "La descripción debe tener mínimo 3 caracteres"),

  RutaImagen: yup.string().nullable(),

  IdCategoria: yup
    .number()
    .typeError("Seleccione una categoría")
    .required("La categoría es requerida"),

  Productos: yup.array().min(1, "Debe agregar al menos un producto"),
});

export default function ListCombosAdmin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rol } = useAuth();
  const esAdministrador = rol === ROLES.ADMINISTRADOR;

  const [data, setData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [open, setOpen] = useState(false);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [openDelete, setOpenDelete] = useState(false);
  const [comboEliminar, setComboEliminar] = useState(null);
  const [previewImagen, setPreviewImagen] = useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Configuración de react-hook-form con yup para validación
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(comboSchema),

    defaultValues: {
      Nombre: "",
      Descripcion: "",
      PrecioEspecial: "",
      RutaImagen: "",
      IdCategoria: "",
      Activo: 1,
      Productos: [],
    },
  });

  // Se obtienen  los productos agregados al combo desde el formulario
  const productosAgregados = watch("Productos");

  //| useEffect para cargar combos, productos y categorías al montar el componente
  useEffect(() => {
    cargarCombos();
    cargarProductos();
    cargarCategorias();
  }, []);


  // Función para cargar los combos desde el servicio
  const cargarCombos = async () => {
    try {

      // Se obtiene la lista de combos desde el servicio 
      const response = await ComboService.getCombos();

      const agrupados = response.data.reduce((acc, item) => {

        // Se busca si el combo ya existe en el acumulador
        let combo = acc.find((c) => c.IdCombo === item.IdCombo);

        if (!combo) {
          combo = {
            ...item,
            Productos: [],
          };

          // Se agrega el combo al acumulador
          acc.push(combo);
        }

        if (item.IdProducto) {
          combo.Productos.push({
            IdProducto: item.IdProducto,
            Nombre: item.NombreProducto,
            Cantidad: item.Cantidad,
          });
        }

        return acc;
      }, []);

      // Se actualiza el estado con la lista de combos agrupados
      setData(agrupados);
    } catch (error) {
      console.error(error);
      toast.error(t("combos.messages.loadError"));
    }
  };

  // Función para cargar los productos desde el servicio
  const cargarProductos = async () => {
    try {
      // Se obtiene la lista de productos desde el servicio
      const response = await ProductoService.getProductos();
      // Se actualiza el estado con la lista de productos
      setProductos(response.data || []);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  // Función para cargar las categorías desde el servici:
  const cargarCategorias = async () => {
    try {
      const response = await CategoriaService.getCategorias();
      setCategorias(response.data || []);
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };


  // Función para manejar la apertura del diálogo de edición/creación de combos
  const handleEdit = (combo) => {
    setPreviewImagen("");

    if (combo) {

      // Si se pasa un combo, se establece como seleccionado y se rellenan los campos del formulario
      setComboSeleccionado(combo);

      reset({
        Nombre: combo.NombreCombo,
        Descripcion: combo.Descripcion,
        PrecioEspecial: combo.PrecioEspecial,
        RutaImagen: combo.RutaImagen || "",
        IdCategoria: combo.IdCategoria,
        Activo: combo.Activo ?? 1,
        Productos:
          combo.Productos?.map((p) => ({
            IdProducto: p.IdProducto,
            Cantidad: p.Cantidad,
          })) || [],
      });
    } else {
      setComboSeleccionado(null);

      reset({
        Nombre: "",
        Descripcion: "",
        PrecioEspecial: "",
        RutaImagen: "",
        IdCategoria: "",
        Activo: 1,
        Productos: [],
      });
    }

    setOpen(true);
  };

  // Función para manejar el cierre del diálogo de edición/creación de combos
  const handleSave = async (data) => {
    try {
      console.log("Datos enviados:", data);

      if (comboSeleccionado?.IdCombo) {
        await ComboService.updateCombo(comboSeleccionado.IdCombo, data);

        toast.success(t("combos.messages.updated"));
      } else {
        await ComboService.createCombo(data);

        toast.success(t("combos.messages.created"));
      }

      setOpen(false);
      setComboSeleccionado(null);
      reset();
      cargarCombos();
    } catch (error) {
      console.error(error);
      toast.error(t("combos.messages.saveError"));
    }
  };


  // Función para manejar el cambio de imagen del combo
  const handleImagenChange = async (e) => {

    // Se obtiene el archivo seleccionado
    const archivo = e.target.files?.[0];

    // Si no hay archivo seleccionado, se retorna
    if (!archivo) return;

    // Se validan el tipo y tamaño del archivo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    // Tamaño máximo permitido: 5MB
    const tamanoMaximo = 5 * 1024 * 1024;

    if (

      // Si el tipo de archivo no está permitido o el tamaño es mayor al máximo permitido, 
      // se muestra un mensaje de error y se retorna
      !tiposPermitidos.includes(archivo.type) ||
      archivo.size > tamanoMaximo
    ) {
      toast.error(t("combos.messages.invalidImage"));
      e.target.value = "";
      return;
    }

    // Se establece la imagen de vista previa
    setPreviewImagen(URL.createObjectURL(archivo));

    try {

      // Se sube la imagen al servidor y se obtiene la ruta de la imagen
      setSubiendoImagen(true);

      // Se llama al servicio para subir la imagen y se obtiene la respuesta
      const response = await ComboService.uploadImagen(archivo);

      // Se establece la ruta de la imagen en el formulario
      setValue("RutaImagen", response.data.ruta, { shouldValidate: true });
    } catch (error) {
      console.error(error);
      toast.error(t("combos.messages.uploadImageError"));
      setPreviewImagen("");
    } finally {
      // Se indica que la imagen ya no se está subiendo y se limpia el input de archivo
      setSubiendoImagen(false);
      e.target.value = "";
    }
  };

  // Función para manejar la eliminación de un combo
  const handleDelete = async () => {
    try {
      await ComboService.delete(comboEliminar.IdCombo);

      toast.success(t("combos.messages.deleted"));
      setOpenDelete(false);
      setComboEliminar(null);
      cargarCombos();
    } catch (error) {
      console.error(error);
      toast.error(t("combos.messages.deleteError"));
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
        // Se muestra el título de la página de combos
        {t("combos.title")}
      </Typography>

      // Se muestra el botón para crear un nuevo combo solo si el usuario es administrador
      {esAdministrador && (
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
            {t("combos.new")}
          </Button>
        </Box>
      )}

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

            // Se muestra un mensaje si no hay combos disponibles
            {t("combos.noCombos")}
          </Typography>
        ) : (

          // Se mapea la lista de combos y se renderiza un Card para cada combo
          data.map((combo) => (
            <Card
              key={combo.IdCombo}
              sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,.12)",
              }}
            >

              // Se muestra la imagen del combo y el precio especial en un Chip
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="170"
                  image={
                    combo.RutaImagen
                      ? `http://localhost:81/apirutaurbana/${combo.RutaImagen}`
                      : "/no-image.png"
                  }
                  alt={combo.NombreCombo}
                  sx={{
                    objectFit: "cover",
                  }}
                />

                <Chip

                // Se muestra el precio especial del combo en un Chip con estilo personalizado
                  label={`₡${Number(combo.PrecioEspecial).toLocaleString(
                    "es-CR",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    },
                  )}`}
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: "#FF8C00",
                    color: "#111111",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    boxShadow: "0 3px 10px rgba(0,0,0,.35)",
                  }}
                />
              </Box>

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1.3rem",
                  }}
                >
                  {combo.NombreCombo}
                </Typography>

                <Typography align="center" color="text.secondary">
                  {combo.Descripcion}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  borderTop: "1px solid #eee",
                }}
              >
                <Box />

                <Button
                  size="medium"
                  sx={{
                    justifySelf: "center",
                    color: "#000000",
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                    px: 3,
                    py: 0.8,
                  }}

                  // Se navega a la página de detalle del combo al hacer clic en el botón
                  onClick={() => navigate(`/combos/${combo.IdCombo}`)}
                >
                  {t("actions.viewDetail")}
                </Button>

                <Box sx={{ justifySelf: "end", display: "flex" }}>

                  // Se muestran los botones de editar y eliminar solo si el usuario es administrador
                  {esAdministrador && (
                    <>
                      <IconButton onClick={() => handleEdit(combo)}>
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => {
                          setComboEliminar(combo);
                          setOpenDelete(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </CardActions>
            </Card>
          ))
        )}
      </Box>

      <Dialog
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setComboEliminar(null);
        }}
      >
        <DialogTitle>{t("combos.confirmDeleteTitle")}</DialogTitle>

        <DialogContent>
          <Typography>
            {t("combos.confirmDeleteMessage")}:
            <b> {comboEliminar?.NombreCombo}</b>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenDelete(false);
              setComboEliminar(null);
            }}
          >
            {t("actions.cancel")}
          </Button>

          <Button variant="contained" color="error" onClick={handleDelete}>
            {t("actions.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {comboSeleccionado?.IdCombo ? t("combos.edit") : t("combos.new")}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label={t("fields.name")}
            value={watch("Nombre")}
            onChange={(e) =>
              setValue("Nombre", e.target.value, {
                shouldValidate: true,
              })
            }
            error={!!errors.Nombre}
            helperText={errors.Nombre?.message}
          />

          <TextField
            fullWidth
            margin="dense"
            label={t("combos.specialPrice")}
            type="number"
            value={watch("PrecioEspecial")}
            onChange={(e) =>
              setValue("PrecioEspecial", e.target.value, {
                shouldValidate: true,
              })
            }
            error={!!errors.PrecioEspecial}
            helperText={errors.PrecioEspecial?.message}
          />

          <TextField
            fullWidth
            margin="dense"
            label={t("fields.description")}
            multiline
            rows={3}
            value={watch("Descripcion")}
            onChange={(e) =>
              setValue("Descripcion", e.target.value, {
                shouldValidate: true,
              })
            }
            error={!!errors.Descripcion}
            helperText={errors.Descripcion?.message}
          />

          <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
            {t("fields.image")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={

                // Se muestra la imagen de vista previa si existe, 
                // de lo contrario se muestra la imagen del combo o una imagen por defecto
                previewImagen ||
                (watch("RutaImagen")
                  ? `http://localhost:81/apirutaurbana/${watch("RutaImagen")}`
                  : "/no-image.png")
              }
              alt="preview"
              sx={{
                width: 90,
                height: 90,
                objectFit: "cover",
                borderRadius: 2,
                border: "1px solid #ddd",
              }}
            />

            <Button
              component="label"
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              disabled={subiendoImagen}
              sx={{
                color: "#FF8C00",
                borderColor: "#FF8C00",
              }}
            >

              // Se muestra un mensaje diferente en el botón según el estado de la imagen
              {subiendoImagen
                ? t("combos.uploadingImage")
                : watch("RutaImagen")
                  ? t("combos.changeImage")
                  : t("combos.selectImage")}

              <input
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImagenChange}
              />
            </Button>
          </Box>

          <TextField
            select
            fullWidth
            margin="dense"
            label={t("fields.category")}
            value={watch("IdCategoria")}
            onChange={(e) =>
              setValue("IdCategoria", Number(e.target.value), {
                shouldValidate: true,
              })
            }
            error={!!errors.IdCategoria}
            helperText={errors.IdCategoria?.message}
          >

            // Se mapea la lista de categorías y se renderiza un MenuItem para cada categoría
            {categorias.map((cat) => (
              <MenuItem key={cat.IdCategoria} value={cat.IdCategoria}>
                {cat.Nombre}
              </MenuItem>
            ))}
          </TextField>

          <Typography
            sx={{
              mt: 2,
              mb: 1,
              fontWeight: "bold",
            }}
          >
            {t("combos.comboProducts")}
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
              label={t("combos.selectProduct")}

              // Se mapea la lista de productos y se renderiza un MenuItem para cada producto
              value={productoSeleccionado}

              // Se actualiza el estado del producto seleccionado al cambiar el valor del select
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              {productos.map((prod) => (
                <MenuItem key={prod.IdProducto} value={prod.IdProducto}>
                  {prod.Nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("combos.quantity")}
              type="number"
              value={cantidadProducto}
              sx={{
                width: 120,
              }}
              onChange={(e) => setCantidadProducto(e.target.value)}
            />

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
                if (!productoSeleccionado) {
                  toast.error(t("combos.messages.selectProduct"));
                  return;
                }

                const existe = productosAgregados.some(
                  (p) => Number(p.IdProducto) === Number(productoSeleccionado),
                );

                if (existe) {
                  toast.error(t("combos.messages.duplicateProduct"));
                  return;
                }

                const nuevosProductos = [
                  ...productosAgregados,
                  {
                    IdProducto: Number(productoSeleccionado),
                    Cantidad: Number(cantidadProducto) || 1,
                  },
                ];

                setValue("Productos", nuevosProductos, {
                  shouldValidate: true,
                });

                setProductoSeleccionado("");
                setCantidadProducto(1);
              }}
            >
              {t("actions.add")}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 2,
            }}
          >
            {productosAgregados?.map((prod) => (
              <Box
                key={prod.IdProducto}
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
                <Typography>
                  {
                    productos.find(
                      (p) => Number(p.IdProducto) === Number(prod.IdProducto),
                    )?.Nombre
                  }
                  {" x "}
                  {prod.Cantidad}
                </Typography>

                <IconButton
                  color="error"
                  onClick={() => {
                    const nuevosProductos = productosAgregados.filter(
                      (p) => p.IdProducto !== prod.IdProducto,
                    );

                    setValue("Productos", nuevosProductos, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          // Se muestra el mensaje de error si hay productos duplicados
          {errors.Productos && (
            <Typography
              color="error"
              sx={{
                mt: 1,
              }}
            >
              {errors.Productos.message}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          // Se muestra el botón de cancelar para cerrar el diálogo sin guardar cambios
          <Button onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>

          <Button
            variant="contained"
            onClick={handleSubmit(handleSave)}
            disabled={subiendoImagen}
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
