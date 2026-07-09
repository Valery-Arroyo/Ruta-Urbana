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

import ComboService from "../../services/ComboService";
import ProductoService from "../../services/ProductoService";
import CategoriaService from "../../services/CategoriaService";

import toast from "react-hot-toast";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";

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

  Descripcion: yup.string().required("La descripción es requerida"),

  RutaImagen: yup.string().nullable(),

  IdCategoria: yup
    .number()
    .typeError("Seleccione una categoría")
    .required("La categoría es requerida"),

  Productos: yup.array().min(1, "Debe agregar al menos un producto"),
});

export default function ListCombosAdmin() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const [productos, setProductos] = useState([]);

  const [categorias, setCategorias] = useState([]);

  const [open, setOpen] = useState(false);

  const [comboSeleccionado, setComboSeleccionado] = useState(null);

  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  const [cantidadProducto, setCantidadProducto] = useState(1);

  // ELIMINAR COMBO

  const [openDelete, setOpenDelete] = useState(false);

  const [comboEliminar, setComboEliminar] = useState(null);

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

  const productosAgregados = watch("Productos");

  useEffect(() => {
    cargarCombos();

    cargarProductos();

    cargarCategorias();
  }, []);

  const cargarCombos = async () => {
    try {
      const response = await ComboService.getCombos();

      const agrupados = response.data.reduce((acc, item) => {
        let combo = acc.find((c) => c.IdCombo === item.IdCombo);

        if (!combo) {
          combo = {
            ...item,

            Productos: [],
          };

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

      setData(agrupados);
    } catch (error) {
      console.error(error);

      toast.error("Error cargando combos");
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();

      setProductos(response.data || []);
    } catch (error) {
      console.error("Error cargando productos", error);
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

  const handleEdit = (combo) => {
    if (combo) {
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

  const handleSave = async (data) => {
    try {
      console.log("Datos enviados:", data);

      if (comboSeleccionado?.IdCombo) {
        await ComboService.updateCombo(
          comboSeleccionado.IdCombo,

          data,
        );

        toast.success("Combo actualizado correctamente");
      } else {
        await ComboService.createCombo(data);

        toast.success("Combo creado correctamente");
      }

      setOpen(false);

      setComboSeleccionado(null);

      reset();

      cargarCombos();
    } catch (error) {
      console.error(error);

      toast.error("Error guardando combo");
    }
  };

  const handleDelete = async () => {
    try {
      await ComboService.delete(comboEliminar.IdCombo);

      toast.success("Combo eliminado correctamente");

      setOpenDelete(false);

      setComboEliminar(null);

      cargarCombos();
    } catch (error) {
      console.error(error);

      toast.error("Error eliminando combo");
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
        Gestión de Combos
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
          Nuevo Combo
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
            No hay combos registrados.
          </Typography>
        ) : (
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
                  {combo.NombreCombo}
                </Typography>

                <Typography align="center" color="text.secondary">
                  {combo.Descripcion}
                </Typography>

                <Typography
                  align="center"
                  sx={{
                    mt: 1,

                    fontWeight: "bold",

                    color: "#FF8C00",
                  }}
                >
                  ₡{combo.PrecioEspecial}
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
                  onClick={() => navigate(`/combos/${combo.IdCombo}`)}
                >
                  <ZoomInIcon />
                </IconButton>

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
              </CardActions>
            </Card>
          ))
        )}
      </Box>

      {/* DIALOG ÚNICO PARA ELIMINAR COMBO */}

      <Dialog
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);

          setComboEliminar(null);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>

        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar el combo:
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
            Cancelar
          </Button>

          <Button variant="contained" color="error" onClick={handleDelete}>
            Eliminar
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
          {comboSeleccionado?.IdCombo ? "Editar Combo" : "Nuevo Combo"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Nombre"
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
            label="Precio especial"
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
            label="Descripción"
            multiline
            rows={3}
            value={watch("Descripcion")}
            onChange={(e) =>
              setValue("Descripcion", e.target.value, {
                shouldValidate: true,
              })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Ruta imagen"
            placeholder="imagenes/combo.jpg"
            value={watch("RutaImagen")}
            onChange={(e) => setValue("RutaImagen", e.target.value)}
            helperText="Ejemplo: imagenes/combo1.jpg"
          />

          <TextField
            select
            fullWidth
            margin="dense"
            label="Categoría"
            value={watch("IdCategoria")}
            onChange={(e) =>
              setValue(
                "IdCategoria",

                Number(e.target.value),

                {
                  shouldValidate: true,
                },
              )
            }
            error={!!errors.IdCategoria}
            helperText={errors.IdCategoria?.message}
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.IdCategoria} value={cat.IdCategoria}>
                {cat.Nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            margin="dense"
            label="Estado"
            value={watch("Activo")}
            onChange={(e) =>
              setValue(
                "Activo",

                Number(e.target.value),
              )
            }
          >
            <MenuItem value={1}>Activo</MenuItem>

            <MenuItem value={0}>Inactivo</MenuItem>
          </TextField>

          <Typography
            sx={{
              mt: 2,

              mb: 1,

              fontWeight: "bold",
            }}
          >
            Productos del combo
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
              label="Seleccionar producto"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              {productos.map((prod) => (
                <MenuItem key={prod.IdProducto} value={prod.IdProducto}>
                  {prod.Nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Cantidad"
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
                  toast.error("Seleccione un producto");

                  return;
                }

                const existe = productosAgregados.some(
                  (p) => Number(p.IdProducto) === Number(productoSeleccionado),
                );

                if (existe) {
                  toast.error("El producto ya está agregado");

                  return;
                }

                const nuevosProductos = [
                  ...productosAgregados,

                  {
                    IdProducto: Number(productoSeleccionado),

                    Cantidad: Number(cantidadProducto) || 1,
                  },
                ];

                setValue(
                  "Productos",

                  nuevosProductos,

                  {
                    shouldValidate: true,
                  },
                );

                setProductoSeleccionado("");

                setCantidadProducto(1);
              }}
            >
              AGREGAR
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

                    setValue(
                      "Productos",

                      nuevosProductos,

                      {
                        shouldValidate: true,
                      },
                    );
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

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
