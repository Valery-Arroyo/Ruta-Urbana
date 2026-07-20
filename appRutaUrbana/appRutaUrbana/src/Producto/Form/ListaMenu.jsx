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
  MenuItem,
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

const formatearHoraNormal = (hora) => {
  if (!hora) return "";

  const [horaTexto, minutosTexto = "00"] = String(hora).split(":");

  const horaNumero = Number(horaTexto);

  if (Number.isNaN(horaNumero)) return hora;

  const periodo = horaNumero >= 12 ? "p. m." : "a. m.";

  const horaNormal = horaNumero % 12 || 12;

  return `${horaNormal}:${minutosTexto} ${periodo}`;
};

const convertirHora24A12 = (hora) => {
  if (!hora) {
    return {
      hora: "",
      minutos: "00",
      periodo: "a. m.",
    };
  }

  const [horaTexto, minutosTexto = "00"] = String(hora).split(":");

  const horaNumero = Number(horaTexto);

  return {
    hora: String(horaNumero % 12 || 12),
    minutos: minutosTexto,
    periodo: horaNumero >= 12 ? "p. m." : "a. m.",
  };
};

const convertirHora12A24 = (hora, minutos, periodo) => {
  if (!hora || minutos === "" || !periodo) {
    return "";
  }

  let horaNumero = Number(hora);

  if (periodo === "a. m." && horaNumero === 12) {
    horaNumero = 0;
  }

  if (periodo === "p. m." && horaNumero !== 12) {
    horaNumero += 12;
  }

  return `${String(horaNumero).padStart(
    2,
    "0",
  )}:${String(minutos).padStart(2, "0")}:00`;
};

const obtenerFechaMenu = (menu, campo) => {
  const valorDirecto = menu?.[campo];

  if (valorDirecto) {
    return String(valorDirecto).substring(0, 10);
  }

  return "";
};

const menuSchema = yup.object({
  Nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(3, "Debe tener mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  HoraInicio: yup
    .string()
    .required("La hora inicial es requerida")
    .matches(HORA_REGEX, "Formato de hora inválido"),

  HoraFin: yup
    .string()
    .required("La hora final es requerida")
    .matches(HORA_REGEX, "Formato de hora inválido")
    .test("horaMayor", "La hora final debe ser mayor", function (value) {
      const { HoraInicio } = this.parent;

      if (!HoraInicio || !value) return true;

      return value > HoraInicio;
    }),

  FechaInicio: yup.string().nullable(),

  FechaFin: yup
    .string()
    .nullable()
    .test(
      "fechaFinMayor",
      "La fecha final debe ser igual o posterior a la fecha inicial",
      function (value) {
        const { FechaInicio } = this.parent;

        if (!FechaInicio && !value) {
          return true;
        }

        if (FechaInicio && !value) {
          return this.createError({
            message: "Debe seleccionar la fecha final",
          });
        }

        if (!FechaInicio && value) {
          return this.createError({
            message: "Debe seleccionar la fecha inicial",
          });
        }

        return value >= FechaInicio;
      },
    ),

  EstaActivo: yup.number().required(),

  DiasDisponibles: yup.array().of(yup.string()),

  Items: yup.array(),

  TieneProducto: yup
    .boolean()
    .oneOf([true], "Debe agregar al menos un producto"),

  TieneCombo: yup.boolean().oneOf([true], "Debe agregar al menos un combo"),
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

  const [horaInicio12, setHoraInicio12] = useState("");

  const [minutosInicio, setMinutosInicio] = useState("00");

  const [periodoInicio, setPeriodoInicio] = useState("a. m.");

  const [horaFin12, setHoraFin12] = useState("");

  const [minutosFin, setMinutosFin] = useState("00");

  const [periodoFin, setPeriodoFin] = useState("p. m.");

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

  const horasNormales = Array.from(
    {
      length: 12,
    },
    (_, index) => String(index + 1),
  );

  const opcionesMinutos = ["00", "15", "30", "45"];

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
      FechaInicio: "",
      FechaFin: "",
      EstaActivo: 1,
      DiasDisponibles: [],
      Items: [],
      TieneProducto: false,
      TieneCombo: false,
    },
  });

  const diasSeleccionados = watch("DiasDisponibles");

  const fechaInicioSeleccionada = watch("FechaInicio");

  useEffect(() => {
    cargarMenus();
    cargarProductos();
    cargarCombos();
  }, []);

  /*
   * Sincroniza los ítems seleccionados con
   * react-hook-form y actualiza las validaciones
   * de producto y combo.
   */
  useEffect(() => {
    const tieneProducto = itemsSeleccionados.some(
      (item) => item.IdProducto != null,
    );

    const tieneCombo = itemsSeleccionados.some((item) => item.IdCombo != null);

    setValue("Items", itemsSeleccionados, {
      shouldValidate: true,
    });

    setValue("TieneProducto", tieneProducto, {
      shouldValidate: true,
    });

    setValue("TieneCombo", tieneCombo, {
      shouldValidate: true,
    });
  }, [itemsSeleccionados, setValue]);

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

    if (String(menu.EstaActivo) !== "1") {
      return false;
    }

    if (!menu.HoraInicio || !menu.HoraFin) {
      return false;
    }

    const fechaActual = ahora.toISOString().substring(0, 10);

    const fechaInicioMenu = obtenerFechaMenu(menu, "FechaInicio");

    const fechaFinMenu = obtenerFechaMenu(menu, "FechaFin");

    if (fechaInicioMenu && fechaActual < fechaInicioMenu) {
      return false;
    }

    if (fechaFinMenu && fechaActual > fechaFinMenu) {
      return false;
    }

    const [hIni, mIni, sIni] = menu.HoraInicio.split(":").map(Number);

    const [hFin, mFin, sFin] = menu.HoraFin.split(":").map(Number);

    const inicio = new Date(ahora);

    inicio.setHours(hIni, mIni, sIni || 0, 0);

    const fin = new Date(ahora);

    fin.setHours(hFin, mFin, sFin || 0, 0);

    if (ahora < inicio || ahora > fin) {
      return false;
    }

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
        .map((dia) => dia.trim())
        .includes(diaActual);
    }

    return true;
  };

  const agregarProducto = (producto) => {
    if (!producto) return;

    const existe = itemsSeleccionados.some(
      (item) => Number(item.IdProducto) === Number(producto.IdProducto),
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
      (item) => Number(item.IdCombo) === Number(combo.IdCombo),
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

  const eliminarItem = (itemEliminar) => {
    setItemsSeleccionados((itemsActuales) =>
      itemsActuales.filter((item) => {
        if (itemEliminar.IdProducto != null) {
          return Number(item.IdProducto) !== Number(itemEliminar.IdProducto);
        }

        if (itemEliminar.IdCombo != null) {
          return Number(item.IdCombo) !== Number(itemEliminar.IdCombo);
        }

        return true;
      }),
    );
  };

  const cambiarCantidad = (index, cantidad) => {
    const copia = [...itemsSeleccionados];

    copia[index].Cantidad = Number(cantidad);

    if (copia[index].Cantidad < 1) {
      copia[index].Cantidad = 1;
    }

    setItemsSeleccionados(copia);
  };

  const handleEdit = async (menu) => {
    if (menu) {
      setMenuSeleccionado(menu);

      const horaInicioConvertida = convertirHora24A12(menu.HoraInicio);

      const horaFinConvertida = convertirHora24A12(menu.HoraFin);

      setHoraInicio12(horaInicioConvertida.hora);

      setMinutosInicio(horaInicioConvertida.minutos);

      setPeriodoInicio(horaInicioConvertida.periodo);

      setHoraFin12(horaFinConvertida.hora);

      setMinutosFin(horaFinConvertida.minutos);

      setPeriodoFin(horaFinConvertida.periodo);

      reset({
        Nombre: menu.Nombre || "",
        HoraInicio: menu.HoraInicio || "",
        HoraFin: menu.HoraFin || "",

        FechaInicio: obtenerFechaMenu(menu, "FechaInicio"),

        FechaFin: obtenerFechaMenu(menu, "FechaFin"),

        EstaActivo: Number(menu.EstaActivo ?? 1),

        DiasDisponibles: menu.DiasDisponibles
          ? menu.DiasDisponibles.split(",")
              .map((dia) => dia.trim())
              .filter(Boolean)
          : [],

        Items: [],
        TieneProducto: false,
        TieneCombo: false,
      });

      setItemsSeleccionados([]);

      try {
        const response = await MenuService.get(menu.IdMenu);

        console.log("DETALLE COMPLETO DEL MENÚ:", response.data);

        const respuesta = response.data;

        const detalle = Array.isArray(respuesta)
          ? respuesta[0] || {}
          : respuesta?.data || respuesta || {};

        const productosRespuesta = Array.isArray(detalle.Productos)
          ? detalle.Productos
          : Array.isArray(detalle.productos)
            ? detalle.productos
            : [];

        const combosRespuesta = Array.isArray(detalle.Combos)
          ? detalle.Combos
          : Array.isArray(detalle.combos)
            ? detalle.combos
            : [];

        const productosDetalle = productosRespuesta.map((item) => ({
          IdProducto:
            item.IdProducto ?? item.idProducto ?? item.idproducto ?? null,

          IdCombo: null,

          Nombre:
            item.Nombre ??
            item.NombreProducto ??
            item.nombre ??
            "Producto sin nombre",

          Tipo: "Producto",

          Cantidad: Number(item.Cantidad ?? item.cantidad ?? 1),
        }));

        const combosDetalle = combosRespuesta.map((item) => ({
          IdProducto: null,

          IdCombo: item.IdCombo ?? item.idCombo ?? item.idcombo ?? null,

          Nombre:
            item.Nombre ??
            item.NombreCombo ??
            item.nombre ??
            "Combo sin nombre",

          Tipo: "Combo",

          Cantidad: Number(item.Cantidad ?? item.cantidad ?? 1),
        }));

        const itemsCargados = Array.from(
          new Map(
            [...productosDetalle, ...combosDetalle].map((item) => {
              const clave =
                item.IdProducto != null
                  ? `producto-${Number(item.IdProducto)}`
                  : `combo-${Number(item.IdCombo)}`;

              return [clave, item];
            }),
          ).values(),
        );

        setItemsSeleccionados(itemsCargados);

        setValue("Items", itemsCargados, {
          shouldValidate: true,
        });

        setValue(
          "TieneProducto",
          itemsCargados.some((item) => item.IdProducto != null),
          {
            shouldValidate: true,
          },
        );

        setValue(
          "TieneCombo",
          itemsCargados.some((item) => item.IdCombo != null),
          {
            shouldValidate: true,
          },
        );
      } catch (error) {
        console.error("Error cargando detalle del menú", error);

        console.error("Respuesta del backend:", error.response?.data);

        console.error("Estado HTTP:", error.response?.status);

        setItemsSeleccionados([]);

        setValue("Items", [], {
          shouldValidate: true,
        });

        setValue("TieneProducto", false, {
          shouldValidate: true,
        });

        setValue("TieneCombo", false, {
          shouldValidate: true,
        });

        toast.error(
          error.response?.data?.message ||
            "No se pudieron cargar los productos/combos del menú",
        );
      }
    } else {
      setMenuSeleccionado(null);
      setItemsSeleccionados([]);

      setHoraInicio12("");
      setMinutosInicio("00");
      setPeriodoInicio("a. m.");

      setHoraFin12("");
      setMinutosFin("00");
      setPeriodoFin("p. m.");

      reset({
        Nombre: "",
        HoraInicio: "",
        HoraFin: "",
        FechaInicio: "",
        FechaFin: "",
        EstaActivo: 1,
        DiasDisponibles: [],
        Items: [],
        TieneProducto: false,
        TieneCombo: false,
      });
    }

    setProductoSeleccionado(null);
    setComboSeleccionado(null);
    setOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      const dataEnviar = {
        Nombre: formData.Nombre,
        HoraInicio: formData.HoraInicio,
        HoraFin: formData.HoraFin,
        FechaInicio: formData.FechaInicio,
        FechaFin: formData.FechaFin,
        EstaActivo: formData.EstaActivo,

        Disponibilidad: (formData.DiasDisponibles || []).map((dia) => ({
          DiaSemana: dia,
          FechaInicio: formData.FechaInicio,
          FechaFin: formData.FechaFin,
        })),

        Items: itemsSeleccionados.map((item) => ({
          IdProducto: item.IdProducto ?? null,

          IdCombo: item.IdCombo ?? null,

          Cantidad: item.Cantidad || 1,
        })),

        Productos: itemsSeleccionados
          .filter((item) => item.IdProducto != null)
          .map((item) => ({
            IdProducto: item.IdProducto,
            Cantidad: item.Cantidad || 1,
          })),

        Combos: itemsSeleccionados
          .filter((item) => item.IdCombo != null)
          .map((item) => ({
            IdCombo: item.IdCombo,
            Cantidad: item.Cantidad || 1,
          })),
      };

      console.log("DATOS MENU", dataEnviar);

      if (menuSeleccionado?.IdMenu) {
        await MenuService.update(menuSeleccionado.IdMenu, dataEnviar);

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

      setHoraInicio12("");
      setMinutosInicio("00");
      setPeriodoInicio("a. m.");

      setHoraFin12("");
      setMinutosFin("00");
      setPeriodoFin("p. m.");

      reset({
        Nombre: "",
        HoraInicio: "",
        HoraFin: "",
        FechaInicio: "",
        FechaFin: "",
        EstaActivo: 1,
        DiasDisponibles: [],
        Items: [],
        TieneProducto: false,
        TieneCombo: false,
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

        actuales.filter((diaActual) => diaActual !== dia),

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

  if (loading) {
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
  }

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
                    {formatearHoraNormal(menu.HoraInicio)} -{" "}
                    {formatearHoraNormal(menu.HoraFin)}
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

      {/* CONFIRMAR ELIMINACIÓN */}

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

      {/* CREAR O EDITAR MENÚ */}

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

          <Typography
            sx={{
              fontWeight: "bold",
              mt: 2,
              mb: 1,
            }}
          >
            Horario del menú
          </Typography>

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },

              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ mb: 1 }}>Hora de inicio</Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 1,
                }}
              >
                <TextField
                  select
                  label="Hora"
                  value={horaInicio12}
                  onChange={(event) => {
                    const nuevaHora = event.target.value;

                    setHoraInicio12(nuevaHora);

                    setValue(
                      "HoraInicio",

                      convertirHora12A24(
                        nuevaHora,
                        minutosInicio,
                        periodoInicio,
                      ),

                      {
                        shouldValidate: true,
                      },
                    );
                  }}
                  error={!!errors.HoraInicio}
                >
                  {horasNormales.map((hora) => (
                    <MenuItem key={`inicio-hora-${hora}`} value={hora}>
                      {hora}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Minutos"
                  value={minutosInicio}
                  onChange={(event) => {
                    const nuevosMinutos = event.target.value;

                    setMinutosInicio(nuevosMinutos);

                    setValue(
                      "HoraInicio",

                      convertirHora12A24(
                        horaInicio12,
                        nuevosMinutos,
                        periodoInicio,
                      ),

                      {
                        shouldValidate: true,
                      },
                    );
                  }}
                >
                  {opcionesMinutos.map((minuto) => (
                    <MenuItem key={`inicio-minuto-${minuto}`} value={minuto}>
                      {minuto}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Periodo"
                  value={periodoInicio}
                  onChange={(event) => {
                    const nuevoPeriodo = event.target.value;

                    setPeriodoInicio(nuevoPeriodo);

                    setValue(
                      "HoraInicio",

                      convertirHora12A24(
                        horaInicio12,
                        minutosInicio,
                        nuevoPeriodo,
                      ),

                      {
                        shouldValidate: true,
                      },
                    );
                  }}
                >
                  <MenuItem value="a. m.">a. m.</MenuItem>

                  <MenuItem value="p. m.">p. m.</MenuItem>
                </TextField>
              </Box>

              {errors.HoraInicio && (
                <Typography color="error" variant="caption">
                  {errors.HoraInicio.message}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography sx={{ mb: 1 }}>Hora de finalización</Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 1,
                }}
              >
                <TextField
                  select
                  label="Hora"
                  value={horaFin12}
                  onChange={(event) => {
                    const nuevaHora = event.target.value;

                    setHoraFin12(nuevaHora);

                    setValue(
                      "HoraFin",

                      convertirHora12A24(nuevaHora, minutosFin, periodoFin),

                      {
                        shouldValidate: true,
                      },
                    );
                  }}
                  error={!!errors.HoraFin}
                >
                  {horasNormales.map((hora) => (
                    <MenuItem key={`fin-hora-${hora}`} value={hora}>
                      {hora}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Minutos"
                  value={minutosFin}
                  onChange={(event) => {
                    const nuevosMinutos = event.target.value;

                    setMinutosFin(nuevosMinutos);

                    setValue(
                      "HoraFin",

                      convertirHora12A24(horaFin12, nuevosMinutos, periodoFin),

                      {
                        shouldValidate: true,
                      },
                    );
                  }}
                >
                  {opcionesMinutos.map((minuto) => (
                    <MenuItem key={`fin-minuto-${minuto}`} value={minuto}>
                      {minuto}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Periodo"
                  value={periodoFin}
                  onChange={(event) => {
                    const nuevoPeriodo = event.target.value;

                    setPeriodoFin(nuevoPeriodo);

                    setValue(
                      "HoraFin",

                      convertirHora12A24(horaFin12, minutosFin, nuevoPeriodo),

                      {
                        shouldValidate: true,
                      },
                    );
                  }}
                >
                  <MenuItem value="a. m.">a. m.</MenuItem>

                  <MenuItem value="p. m.">p. m.</MenuItem>
                </TextField>
              </Box>

              {errors.HoraFin && (
                <Typography color="error" variant="caption">
                  {errors.HoraFin.message}
                </Typography>
              )}
            </Box>
          </Box>

          <Typography
            sx={{
              fontWeight: "bold",
              mt: 3,
              mb: 1,
            }}
          >
            Vigencia del menú
          </Typography>

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
              },

              gap: 2,
              mt: 2,
            }}
          >
            <Controller
              name="FechaInicio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Fecha de inicio"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  error={!!errors.FechaInicio}
                  helperText={errors.FechaInicio?.message}
                />
              )}
            />

            <Controller
              name="FechaFin"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Fecha de finalización"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },

                    htmlInput: {
                      min: fechaInicioSeleccionada || undefined,
                    },
                  }}
                  error={!!errors.FechaFin}
                  helperText={errors.FechaFin?.message}
                />
              )}
            />
          </Box>

          <Controller
            name="EstaActivo"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label="Menú activo"
                control={
                  <Checkbox
                    checked={field.value === 1}
                    onChange={(event) =>
                      field.onChange(event.target.checked ? 1 : 0)
                    }
                  />
                }
              />
            )}
          />

          <Divider sx={{ my: 3 }} />

          {/* AGREGAR PRODUCTO */}

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
              onChange={(event, value) => setProductoSeleccionado(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar producto"
                  error={!!errors.TieneProducto}
                />
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

          {errors.TieneProducto && (
            <Typography
              color="error"
              variant="caption"
              sx={{
                display: "block",
                mt: 0.5,
                ml: 1.75,
              }}
            >
              {errors.TieneProducto.message}
            </Typography>
          )}

          {/* AGREGAR COMBO */}

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
              onChange={(event, value) => setComboSeleccionado(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar combo"
                  error={!!errors.TieneCombo}
                />
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

          {errors.TieneCombo && (
            <Typography
              color="error"
              variant="caption"
              sx={{
                display: "block",
                mt: 0.5,
                ml: 1.75,
              }}
            >
              {errors.TieneCombo.message}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* ÍTEMS SELECCIONADOS */}

          <Typography
            sx={{
              fontWeight: "bold",
            }}
          >
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
                  onChange={(event) =>
                    cambiarCantidad(index, event.target.value)
                  }
                />

                <Button color="error" onClick={() => eliminarItem(item)}>
                  Eliminar
                </Button>
              </Box>
            </Card>
          ))}

          <Divider sx={{ my: 3 }} />

          {/* DÍAS DISPONIBLES */}

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
