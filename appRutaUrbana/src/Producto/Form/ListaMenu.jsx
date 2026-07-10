import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MenuService from "../../services/MenuService";
import ProductoService from "../../services/ProductoService";
import ComboService from "../../services/ComboService";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  Autocomplete,
  Divider,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const menuSchema = yup.object({
  Nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(3, "Debe tener mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  HoraInicio: yup
    .string()
    .required("La hora inicial es requerida")
    .matches(HORA_REGEX, "Formato inválido HH:MM:SS"),

  HoraFin: yup
    .string()
    .required("La hora final es requerida")
    .matches(HORA_REGEX, "Formato inválido HH:MM:SS")
    .test("horaMayor", "La hora final debe ser mayor", function (value) {
      const { HoraInicio } = this.parent;

      if (!HoraInicio || !value) return true;

      return value > HoraInicio;
    }),

  EstaActivo: yup.number().required(),
  DiasDisponibles: yup.array().of(yup.string()),
  Items: yup.array().min(1, "Debe agregar al menos un producto o combo"),
});

export default function ListMenusAdmin() {
  const [menus, setMenus] = useState([]);
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [menuSeleccionado, setMenuSeleccionado] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [menuEliminar, setMenuEliminar] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const navigate = useNavigate();
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,

    formState: { errors },
  } = useForm({
    resolver: yupResolver(menuSchema),

    defaultValues: {
      Nombre: "",
      HoraInicio: "",
      HoraFin: "",
      EstaActivo: 1,
      DiasDisponibles: [],
      Items: [],
    },
  });

  const diasSeleccionados = watch("DiasDisponibles");

  useEffect(() => {
    cargarMenus();
    cargarProductos();
    cargarCombos();
  }, []);

  const cargarMenus = async () => {
    try {
      const response = await MenuService.getMenus();

      setMenus(response.data || []);
    } catch (error) {
      console.error("Error cargando menús", error);
      toast.error("No se pudieron cargar los menús");
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();

      setProductos(response.data || []);
    } catch (error) {
      console.error("Error cargando productos", error);
      toast.error("No se pudieron cargar productos");
    }
  };

  const cargarCombos = async () => {
    try {
      const response = await ComboService.getCombos();

      const data = response.data || [];

      const combosUnicos = Array.from(
        new Map(data.map((combo) => [combo.IdCombo, combo])).values(),
      );

      setCombos(combosUnicos);
    } catch (error) {
      console.error("Error cargando combos", error);
      toast.error("No se pudieron cargar combos");
    }
  };

  const isDisponibleAhora = (menu) => {
    const ahora = new Date();

    if (String(menu.EstaActivo) !== "1") return false;
    if (!menu.HoraInicio || !menu.HoraFin) return false;
    const [hIni, mIni, sIni] = menu.HoraInicio.split(":").map(Number);
    const [hFin, mFin, sFin] = menu.HoraFin.split(":").map(Number);
    const inicio = new Date(ahora);
    inicio.setHours(hIni, mIni, sIni || 0, 0);
    const fin = new Date(ahora);
    fin.setHours(hFin, mFin, sFin || 0, 0);

    if (ahora < inicio || ahora > fin) return false;

    const dias = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];

    const diaActual = dias[ahora.getDay() === 0 ? 6 : ahora.getDay() - 1];

    if (menu.DiasDisponibles && menu.DiasDisponibles.trim() !== "") {
      return menu.DiasDisponibles.split(",")
        .map((d) => d.trim())
        .includes(diaActual);
    }

    return true;
  };

  const agregarProducto = (producto) => {
    if (!producto) return;

    const existe = itemsSeleccionados.some(
      (item) => item.IdProducto === producto.IdProducto,
    );

    if (existe) {
      toast.error("El producto ya está agregado");

      return;
    }

    setItemsSeleccionados([
      ...itemsSeleccionados,

      {
        IdProducto: producto.IdProducto,
        IdCombo: null,
        Nombre: producto.Nombre,
        Tipo: "Producto",
        Cantidad: 1,
      },
    ]);
  };

  const agregarCombo = (combo) => {
    if (!combo) return;

    const existe = itemsSeleccionados.some(
      (item) => item.IdCombo === combo.IdCombo,
    );

    if (existe) {
      toast.error("El combo ya está agregado");

      return;
    }

    setItemsSeleccionados([
      ...itemsSeleccionados,

      {
        IdProducto: null,
        IdCombo: combo.IdCombo,
        Nombre: combo.NombreCombo,
        Tipo: "Combo",
        Cantidad: 1,
      },
    ]);
  };

  const eliminarItem = (index) => {
    setItemsSeleccionados(itemsSeleccionados.filter((_, i) => i !== index));
  };

  const cambiarCantidad = (index, cantidad) => {
    const copia = [...itemsSeleccionados];

    copia[index].Cantidad = Number(cantidad);

    if (copia[index].Cantidad < 1) {
      copia[index].Cantidad = 1;
    }

    setItemsSeleccionados(copia);
  };

  const handleEdit = (menu) => {
    if (menu) {
      setMenuSeleccionado(menu);

      reset({
        Nombre: menu.Nombre || "",
        HoraInicio: menu.HoraInicio || "",
        HoraFin: menu.HoraFin || "",
        EstaActivo: Number(menu.EstaActivo ?? 1),
        DiasDisponibles: menu.DiasDisponibles
          ? menu.DiasDisponibles.split(",")
              .map((d) => d.trim())
              .filter(Boolean)
          : [],

        Items: menu.Items || [],
      });

      const items = menu.Items || [];

      setItemsSeleccionados(
        items.map((item) => ({
          IdProducto: item.IdProducto ?? null,
          IdCombo: item.IdCombo ?? null,
          Nombre:
            item.Nombre ||
            item.NombreProducto ||
            item.NombreCombo ||
            "Sin nombre",

          Tipo: item.IdCombo ? "Combo" : "Producto",

          Cantidad: item.Cantidad || 1,
        })),
      );
    } else {
      setMenuSeleccionado(null);
      setItemsSeleccionados([]);

      reset({
        Nombre: "",
        HoraInicio: "",
        HoraFin: "",
        EstaActivo: 1,
        DiasDisponibles: [],
        Items: [],
      });
    }

    setProductoSeleccionado(null);
    setComboSeleccionado(null);

    setOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (itemsSeleccionados.length === 0) {
        toast.error("Debe agregar productos o combos");

        return;
      }

      const dataEnviar = {
        Nombre: formData.Nombre,
        HoraInicio: formData.HoraInicio,
        HoraFin: formData.HoraFin,
        EstaActivo: formData.EstaActivo,
        Disponibilidad: (formData.DiasDisponibles || []).map((dia) => ({
          DiaSemana: dia,
        })),

        Items: itemsSeleccionados.map((item) => ({
          IdProducto: item.IdProducto ?? null,
          IdCombo: item.IdCombo ?? null,
          Cantidad: item.Cantidad || 1,
        })),
      };

      console.log("DATOS MENU", dataEnviar);

      if (menuSeleccionado?.IdMenu) {
        await MenuService.update(
          menuSeleccionado.IdMenu,

          dataEnviar,
        );

        toast.success("Menú actualizado correctamente");
      } else {
        await MenuService.create(dataEnviar);

        toast.success("Menú creado correctamente");
      }

      setOpen(false);
      setMenuSeleccionado(null);
      setItemsSeleccionados([]);
      setProductoSeleccionado(null);
      setComboSeleccionado(null);

      reset({
        Nombre: "",
        HoraInicio: "",
        HoraFin: "",
        EstaActivo: 1,
        DiasDisponibles: [],
        Items: [],
      });

      cargarMenus();
    } catch (error) {
      console.error("Error guardando menú", error);

      toast.error("Error al guardar menú");
    }
  };

  const toggleDia = (dia) => {
    const actuales = diasSeleccionados || [];

    if (actuales.includes(dia)) {
      setValue(
        "DiasDisponibles",

        actuales.filter((d) => d !== dia),

        {
          shouldValidate: true,
        },
      );
    } else {
      setValue(
        "DiasDisponibles",

        [...actuales, dia],

        {
          shouldValidate: true,
        },
      );
    }
  };
  const confirmarEliminar = (menu) => {
    setMenuEliminar(menu);

    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await MenuService.delete(menuEliminar.IdMenu);

      toast.success("Menú eliminado correctamente");

      setOpenDelete(false);

      setMenuEliminar(null);

      cargarMenus();
    } catch (error) {
      console.error("Error eliminando menú", error);

      toast.error("No se pudo eliminar el menú");
    }
  };
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",

          justifyContent: "center",

          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );

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
        Gestión de Menús
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
          Nuevo Menú
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
        {menus.length === 0 ? (
          <Typography
            sx={{
              gridColumn: "1/-1",

              textAlign: "center",
            }}
          >
            No hay menús registrados
          </Typography>
        ) : (
          menus.map((menu) => {
            const disponible = isDisponibleAhora(menu);

            return (
              <Card
                key={menu.IdMenu}
                sx={{
                  borderRadius: 4,

                  opacity: disponible ? 1 : 0.6,

                  filter: disponible ? "none" : "grayscale(.5)",
                }}
              >
                <CardContent>
                  <Typography
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                    }}
                  >
                    {menu.Nombre}
                  </Typography>

                  <Typography align="center" color="text.secondary">
                    {menu.HoraInicio}-{menu.HoraFin}
                  </Typography>

                  <Typography align="center" sx={{ mt: 1 }}>
                    {menu.DiasDisponibles || "Todos los días"}
                  </Typography>

                  <Typography
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      mt: 1,
                      color: disponible ? "green" : "gray",
                    }}
                  >
                    {disponible ? "Disponible ahora" : "No disponible"}
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
                    onClick={() => navigate(`/menu/${menu.IdMenu}`)}
                  >
                    <ZoomInIcon />
                  </IconButton>

                  <IconButton onClick={() => handleEdit(menu)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => confirmarEliminar(menu)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            );
          })
        )}
      </Box>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>

        <DialogContent>
          <Typography>
            ¿Eliminar menú?
            <b> {menuEliminar?.Nombre}</b>
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>

          <Button color="error" variant="contained" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {menuSeleccionado ? "Editar Menú" : "Crear Menú"}
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
            name="HoraInicio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label="Hora Inicio"
                placeholder="11:00:00"
                error={!!errors.HoraInicio}
                helperText={errors.HoraInicio?.message}
              />
            )}
          />

          <Controller
            name="HoraFin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label="Hora Fin"
                placeholder="15:00:00"
                error={!!errors.HoraFin}
                helperText={errors.HoraFin?.message}
              />
            )}
          />

          <Controller
            name="EstaActivo"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label="Menú activo"
                control={
                  <Checkbox
                    checked={field.value === 1}
                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                  />
                }
              />
            )}
          />

          <Divider sx={{ my: 3 }} />

          <Typography
            sx={{
              fontWeight: "bold",

              mb: 1,
            }}
          >
            Agregar producto
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Autocomplete
              fullWidth
              options={productos}
              value={productoSeleccionado}
              getOptionLabel={(option) => option.Nombre || ""}
              isOptionEqualToValue={(option, value) =>
                option.IdProducto === value.IdProducto
              }
              renderOption={(props, option) => (
                <li {...props} key={`producto-${option.IdProducto}`}>
                  {option.Nombre}
                </li>
              )}
              onChange={(e, value) => setProductoSeleccionado(value)}
              renderInput={(params) => (
                <TextField {...params} label="Buscar producto" />
              )}
            />

            <Button
              variant="contained"
              sx={{
                bgcolor: "#FF8C00",
                height: "56px",
                whiteSpace: "nowrap",

                "&:hover": {
                  bgcolor: "#E67E00",
                },
              }}
              onClick={() => {
                if (!productoSeleccionado) {
                  toast.error("Seleccione un producto");

                  return;
                }

                agregarProducto(productoSeleccionado);
                setProductoSeleccionado(null);
              }}
            >
              AGREGAR
            </Button>
          </Box>

          {/* COMBOS */}

          <Typography
            sx={{
              fontWeight: "bold",
              mt: 3,
              mb: 1,
            }}
          >
            Agregar combos
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Autocomplete
              fullWidth
              options={combos}
              value={comboSeleccionado}
              getOptionLabel={(option) => option.NombreCombo || ""}
              isOptionEqualToValue={(option, value) =>
                option.IdCombo === value.IdCombo
              }
              renderOption={(props, option) => (
                <li {...props} key={`combo-${option.IdCombo}`}>
                  {option.NombreCombo}
                </li>
              )}
              onChange={(e, value) => setComboSeleccionado(value)}
              renderInput={(params) => (
                <TextField {...params} label="Buscar combo" />
              )}
            />

            <Button
              variant="contained"
              sx={{
                bgcolor: "#FF8C00",
                height: "56px",
                whiteSpace: "nowrap",

                "&:hover": {
                  bgcolor: "#E67E00",
                },
              }}
              onClick={() => {
                if (!comboSeleccionado) {
                  toast.error("Seleccione un combo");

                  return;
                }

                agregarCombo(comboSeleccionado);
                setComboSeleccionado(null);
              }}
            >
              AGREGAR
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ fontWeight: "bold" }}>
            Items seleccionados
          </Typography>

          {itemsSeleccionados.map((item, index) => (
            <Card
              key={`${item.Tipo}-${index}`}
              sx={{
                p: 2,
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight="bold">{item.Nombre}</Typography>

                <Chip size="small" label={item.Tipo} />
              </Box>

              <Box
                sx={{
                  display: "flex",

                  gap: 2,
                }}
              >
                <TextField
                  type="number"
                  size="small"
                  label="Cantidad"
                  value={item.Cantidad}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                  onChange={(e) =>
                    cambiarCantidad(
                      index,

                      e.target.value,
                    )
                  }
                />

                <Button color="error" onClick={() => eliminarItem(index)}>
                  Eliminar
                </Button>
              </Box>
            </Card>
          ))}

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight="bold">Días disponibles</Typography>

          <Box
            sx={{
              display: "flex",

              flexWrap: "wrap",
            }}
          >
            {diasSemana.map((dia) => (
              <FormControlLabel
                key={dia}
                label={dia}
                control={
                  <Checkbox
                    checked={(diasSeleccionados || []).includes(dia)}
                    onChange={() => toggleDia(dia)}
                  />
                }
              />
            ))}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>

          <Button
            variant="contained"
            onClick={handleSubmit(handleSave)}
            sx={{
              bgcolor: "#FF8C00",
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
