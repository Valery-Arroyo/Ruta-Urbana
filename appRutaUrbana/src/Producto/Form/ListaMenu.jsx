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

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

// Validación de campos del formulario de menú
const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

// Función para formatear la hora en formato de 12 horas con AM/PM
const formatearHoraNormal = (hora) => {
  if (!hora) return "";

  // Se divide la hora en componentes de hora y minutos
  const [horaTexto, minutosTexto = "00"] = String(hora).split(":");

  // Se convierte la hora a número para determinar el periodo (AM/PM)
  const horaNumero = Number(horaTexto);

  // Si la conversión falla, se retorna la hora original
  if (Number.isNaN(horaNumero)) return hora;

  // Se determina el periodo (AM/PM) según la hora
  const periodo = horaNumero >= 12 ? "p. m." : "a. m.";

  // Se convierte la hora a formato de 12 horas
  const horaNormal = horaNumero % 12 || 12;

  // Se retorna la hora formateada en formato de 12 horas con AM/PM
  return `${horaNormal}:${minutosTexto} ${periodo}`;
};

// Función para convertir la hora de formato de 24 horas a formato de 12 horas con AM/PM
const convertirHora24A12 = (hora) => {
  if (!hora) {
    return {
      hora: "",
      minutos: "00",
      periodo: "a. m.",
    };
  }

  // Se divide la hora en componentes de hora y minutos
  const [horaTexto, minutosTexto = "00"] = String(hora).split(":");

  // Se convierte la hora a número para determinar el periodo (AM/PM)
  const horaNumero = Number(horaTexto);

  // Si la conversión falla, se retorna la hora original
  return {
    hora: String(horaNumero % 12 || 12),
    minutos: minutosTexto,
    periodo: horaNumero >= 12 ? "p. m." : "a. m.",
  };
};

// Función para convertir la hora de formato de 12 horas con AM/PM a formato de 24 horas
const convertirHora12A24 = (hora, minutos, periodo) => {
  if (!hora || minutos === "" || !periodo) {
    return "";
  }

  // Se convierte la hora a número para determinar el periodo (AM/PM)
  let horaNumero = Number(hora);

  // Si la conversión falla, se retorna una cadena vacía
  if (periodo === "a. m." && horaNumero === 12) {
    horaNumero = 0;
  }

  // Si es PM y la hora no es 12, se suma 12 para convertir a formato de 24 horas
  if (periodo === "p. m." && horaNumero !== 12) {
    horaNumero += 12;
  }

  // Se retorna la hora en formato de 24 horas con minutos
  return `${String(horaNumero).padStart(
    2,
    "0",
  )}:${String(minutos).padStart(2, "0")}:00`;
};


// Función para obtener la fecha de inicio o fin del menú en formato YYYY-MM-DD
const obtenerFechaMenu = (menu, campo) => {

  // Se obtiene el valor directo del campo de fecha del menú
  const valorDirecto = menu?.[campo];

  // Si el valor directo existe, se retorna en formato YYYY-MM-DD
  if (valorDirecto) {
    return String(valorDirecto).substring(0, 10);
  }

  return "";
};

// Esquema de validación para el formulario de menú
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

        // Si no hay fecha de inicio ni fecha final, se permite
        if (!FechaInicio && !value) {
          return true;
        }

        // Si hay fecha de inicio pero no fecha final, se requiere la fecha final
        if (FechaInicio && !value) {
          return this.createError({
            message: "Debe seleccionar la fecha final",
          });
        }

        // Si hay fecha final pero no fecha de inicio, se requiere la fecha inicial
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

// Componente principal para listar y administrar menús
export default function ListMenusAdmin() {

  // Se obtienen las funciones de traducción y el rol del usuario autenticado
  const { t } = useTranslation();
  const { rol } = useAuth();

  // Se determina si el usuario es administrador o gestor según su rol
  const esGestor = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;
  const esAdministrador = rol === ROLES.ADMINISTRADOR;

  // Estados locales para manejar la lista de menús, productos, 
  // combos y otros estados del componente
  const [menus, setMenus] = useState([]);
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);

  // Estado para manejar los ítems seleccionados en el formulario de menú
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);

  // Estado para manejar la carga de datos y la apertura de diálogos
  const [loading, setLoading] = useState(true);

  // Estados para manejar la apertura de diálogos y el menú seleccionado
  const [open, setOpen] = useState(false);

  const [menuSeleccionado, setMenuSeleccionado] = useState(null);

  const [openDelete, setOpenDelete] = useState(false);

  // Estado para manejar el menú que se va a eliminar
  const [menuEliminar, setMenuEliminar] = useState(null);

  // Estados para manejar el producto y combo seleccionados en el formulario
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estado para manejar el combo seleccionado en el formulario
  const [comboSeleccionado, setComboSeleccionado] = useState(null);

  // Estados para manejar la hora de inicio y fin en formato de 12 horas con AM/PM
  const [horaInicio12, setHoraInicio12] = useState("");

  // Estado para manejar los minutos de inicio en el formulario
  const [minutosInicio, setMinutosInicio] = useState("00");

  // Estado para manejar el periodo de inicio (AM/PM) en el formulario
  const [periodoInicio, setPeriodoInicio] = useState("a. m.");

  // Estado para manejar la hora de fin en formato de 12 horas con AM/PM
  const [horaFin12, setHoraFin12] = useState("");

  // Estado para manejar los minutos de fin en el formulario
  const [minutosFin, setMinutosFin] = useState("00");

  // Estado para manejar el periodo de fin (AM/PM) en el formulario
  const [periodoFin, setPeriodoFin] = useState("p. m.");

  // Se inicializa el hook de navegación para permitir regresar a la página anterior
  const navigate = useNavigate();

  // Se definen los días de la semana y las opciones de horas y minutos para el formulario
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // Se generan las horas normales de 1 a 12 para el formulario
  const horasNormales = Array.from(
    {
      length: 12,
    },
    // Se genera un array de horas de 1 a 12 para el formulario
    (_, index) => String(index + 1),
  );

  // Se definen las opciones de minutos para el formulario
  const opcionesMinutos = ["00", "15", "30", "45"];

  // Se inicializa el hook de react-hook-form para manejar el formulario de menú
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

  // Se obtienen los valores de los campos del formulario para manejar la lógica de disponibilidad
  const diasSeleccionados = watch("DiasDisponibles");

  // Se obtiene la fecha de inicio seleccionada en el formulario para manejar la lógica de disponibilidad
  const fechaInicioSeleccionada = watch("FechaInicio");

  // Carga inicial de menús, productos y combos al montar el componente
  useEffect(() => {
    cargarMenus();
    cargarProductos();
    cargarCombos();
  }, []);

  useEffect(() => {
    const tieneProducto = itemsSeleccionados.some(
      (item) => item.IdProducto != null,
    );

    // Se determina si hay al menos un combo seleccionado
    const tieneCombo = itemsSeleccionados.some((item) => item.IdCombo != null);

    // Se actualizan los valores de los campos del formulario con los ítems seleccionados 
    // y las validaciones correspondientes
    setValue("Items", itemsSeleccionados, {
      shouldValidate: true,
    });

    // Se actualiza el valor del campo "TieneProducto" en el formulario
    setValue("TieneProducto", tieneProducto, {
      shouldValidate: true,
    });

    setValue("TieneCombo", tieneCombo, {
      shouldValidate: true,
    });
  }, [itemsSeleccionados, setValue]);


  // Función para cargar los menús desde el servicio
  const cargarMenus = async () => {
    try {
      // Se realiza la llamada al servicio para obtener los menús
      const response = await MenuService.getMenus();

      //  Se actualiza el estado con los menús obtenidos del servicio
      setMenus(response.data || []);
    } catch (error) {
      console.error("Error cargando menús", error);

      toast.error(t("menus.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los productos desde el servicio
  const cargarProductos = async () => {
    try {
      const response = await ProductoService.getProductos();

      setProductos(response.data || []);
    } catch (error) {
      console.error("Error cargando productos", error);

      toast.error(t("menus.messages.loadProductsError"));
    }
  };

  // Función para cargar los combos desde el servicio
  const cargarCombos = async () => {
    try {
      const response = await ComboService.getCombos();

      // Se obtiene la lista de combos desde la respuesta del servicio
      const data = response.data || [];

      const combosUnicos = Array.from(
        new Map(data.map((combo) => [combo.IdCombo, combo])).values(),
      );

      setCombos(combosUnicos);
    } catch (error) {
      console.error("Error cargando combos", error);

      toast.error(t("menus.messages.loadCombosError"));
    }
  };

  // Función para determinar si un menú está disponible en el momento actual
  const isDisponibleAhora = (menu) => {

    // Se obtiene la fecha y hora actual
    const ahora = new Date();

    // Se verifica si el menú está activo
    if (String(menu.EstaActivo) !== "1") {
      return false;
    }

    // Se verifica si el menú tiene horas de inicio y fin definidas
    if (!menu.HoraInicio || !menu.HoraFin) {
      return false;
    }

    // Se obtiene la fecha actual en formato YYYY-MM-DD 
    // para compararla con las fechas del menú
    const fechaActual = ahora.toISOString().substring(0, 10);

    // Se obtienen las fechas de inicio y fin del menú en 
    // formato YYYY-MM-DD
    const fechaInicioMenu = obtenerFechaMenu(menu, "FechaInicio");

    // Se obtiene la fecha de fin del menú en formato YYYY-MM-DD
    const fechaFinMenu = obtenerFechaMenu(menu, "FechaFin");


    // Se verifica si la fecha actual está dentro del 
    // rango de fechas del menú
    if (fechaInicioMenu && fechaActual < fechaInicioMenu) {
      return false;
    }

    // Se verifica si la fecha actual está dentro del rango de fechas del menú
    if (fechaFinMenu && fechaActual > fechaFinMenu) {
      return false;
    }

    // Se obtienen las horas de inicio y fin del menú y se convierten a números
    const [hIni, mIni, sIni] = menu.HoraInicio.split(":").map(Number);

    // Se obtienen las horas de fin del menú y se convierten a números
    const [hFin, mFin, sFin] = menu.HoraFin.split(":").map(Number);

    // Se crean objetos Date para la hora de inicio y fin del menú
    const inicio = new Date(ahora);

    // Se establece la hora de inicio del menú en el objeto Date
    inicio.setHours(hIni, mIni, sIni || 0, 0);

    // Se crea un objeto Date para la hora de fin del menú
    const fin = new Date(ahora);

    // Se establece la hora de fin del menú en el objeto Date
    fin.setHours(hFin, mFin, sFin || 0, 0);

    // Se verifica si la hora actual está dentro del rango de horas del menú

    if (ahora < inicio || ahora > fin) {
      return false;
    }

    // 
    const dias = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];

    // Se obtiene el día actual en formato de nombre del día de la semana
    const diaActual = dias[ahora.getDay() === 0 ? 6 : ahora.getDay() - 1];

    // Se verifica si el menú tiene días disponibles definidos y si el día actual está incluido
    if (menu.DiasDisponibles && menu.DiasDisponibles.trim() !== "") {
      return menu.DiasDisponibles.split(",")
        .map((dia) => dia.trim())
        .includes(diaActual);
    }

    return true;
  };

  // Función para agregar un producto a la lista de ítems seleccionados
  const agregarProducto = (producto) => {
    if (!producto) return;

    // Se verifica si el producto ya está en la lista de ítems seleccionados
    const existe = itemsSeleccionados.some(
      (item) => Number(item.IdProducto) === Number(producto.IdProducto),
    );

    if (existe) {
      toast.error(t("menus.messages.duplicateProduct"));

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

  // Función para agregar un combo a la lista de ítems seleccionados
  const agregarCombo = (combo) => {
    if (!combo) return;

    const existe = itemsSeleccionados.some(
      (item) => Number(item.IdCombo) === Number(combo.IdCombo),
    );

    if (existe) {
      toast.error(t("menus.messages.duplicateCombo"));

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
            t("menus.messages.loadDetailError"),
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

        toast.success(t("menus.messages.updated"));
      } else {
        await MenuService.create(dataEnviar);

        toast.success(t("menus.messages.created"));
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

      toast.error(t("menus.messages.saveError"));
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

      toast.success(t("menus.messages.deleted"));

      setOpenDelete(false);
      setMenuEliminar(null);

      cargarMenus();
    } catch (error) {
      console.error("Error eliminando menú", error);

      toast.error(t("menus.messages.deleteError"));
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
        {t("menus.title")}
      </Typography>

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
            {t("menus.new")}
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
        {(() => {
          const menusVisibles = esGestor
            ? menus
            : menus.filter((menu) => isDisponibleAhora(menu));

          if (menusVisibles.length === 0) {
            return (
              <Typography
                sx={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                }}
              >
                {t("menus.noMenus")}
              </Typography>
            );
          }

          return menusVisibles.map((menu) => {
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
                    {disponible
                      ? t("menus.availableNow")
                      : t("menus.notAvailable")}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                  }}
                >
                  <Box />

                  <Button
                    size="medium"
                    onClick={() => navigate(`/menu/${menu.IdMenu}`)}
                    sx={{
                      justifySelf: "center",
                      color: "#000000",
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "1rem",
                      px: 3,
                      py: 0.8,

                      "&:hover": {
                        bgcolor: "rgba(255,140,0,.1)",
                      },
                    }}
                  >
                    {t("actions.viewDetail")}
                  </Button>

                  <Box sx={{ justifySelf: "end", display: "flex" }}>
                    {esAdministrador && (
                      <>
                        <IconButton onClick={() => handleEdit(menu)}>
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => confirmarEliminar(menu)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </CardActions>
              </Card>
            );
          });
        })()}
      </Box>

      {/* CONFIRMAR ELIMINACIÓN */}

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t("menus.confirmDeleteTitle")}</DialogTitle>

        <DialogContent>
          <Typography>
            {t("menus.confirmDeleteMessage")}
            <b> {menuEliminar?.Nombre}</b>
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>
            {t("actions.cancel")}
          </Button>

          <Button color="error" variant="contained" onClick={handleDelete}>
            {t("actions.delete")}
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
          {menuSeleccionado ? t("menus.edit") : t("menus.create")}
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

          <Typography
            sx={{
              fontWeight: "bold",
              mt: 2,
              mb: 1,
            }}
          >
            {t("menus.schedule")}
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
              <Typography sx={{ mb: 1 }}>{t("menus.startTime")}</Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 1,
                }}
              >
                <TextField
                  select
                  label={t("menus.hour")}
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
                  label={t("menus.minutes")}
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
                  label={t("menus.period")}
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
              <Typography sx={{ mb: 1 }}>{t("menus.endTime")}</Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 1,
                }}
              >
                <TextField
                  select
                  label={t("menus.hour")}
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
                  label={t("menus.minutes")}
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
                  label={t("menus.period")}
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
            {t("menus.validity")}
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
                  label={t("menus.startDate")}
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
                  label={t("menus.endDate")}
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
                label={t("menus.activeMenu")}
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
            {t("menus.addProduct")}
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
                  label={t("menus.searchProduct")}
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
                  toast.error(t("menus.messages.selectProduct"));

                  return;
                }

                agregarProducto(productoSeleccionado);

                setProductoSeleccionado(null);
              }}
            >
              {t("actions.add")}
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
            {t("menus.addCombos")}
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
                  label={t("menus.searchCombo")}
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
                  toast.error(t("menus.messages.selectCombo"));

                  return;
                }

                agregarCombo(comboSeleccionado);

                setComboSeleccionado(null);
              }}
            >
              {t("actions.add")}
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
            {t("menus.selectedItems")}
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
                  label={t("combos.quantity")}
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
                  {t("actions.delete")}
                </Button>
              </Box>
            </Card>
          ))}

          <Divider sx={{ my: 3 }} />

          {/* DÍAS DISPONIBLES */}

          <Typography fontWeight="bold">{t("menus.availableDays")}</Typography>

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
            {t("actions.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
