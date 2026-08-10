import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import UsuarioService from "../../services/UsuarioService";

const usuarioSchema = yup.object().shape({
  EsNuevo: yup.boolean(),

  NombreCompleto: yup
    .string()
    .transform((value) => value?.trim())
    .required("El nombre es requerido")
    .min(3, "Debe tener mínimo 3 caracteres"),

  Correo: yup.string().email("Correo inválido").required("El correo es requerido"),

  Contrasena: yup.string().when("EsNuevo", {
    is: true,
    then: (schema) =>
      schema.required("La contraseña es requerida").min(8, "Debe tener al menos 8 caracteres"),
    otherwise: (schema) => schema.notRequired(),
  }),

  Direccion: yup.string().nullable(),

  IdRol: yup
    .number()
    .typeError("Seleccione un rol")
    .required("El rol es requerido"),
});

export default function ListaUsuario() {
  const { t } = useTranslation();
  const { rol } = useAuth();
  const esAdministrador = rol === ROLES.ADMINISTRADOR;

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);

  const [open, setOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [openDesactivar, setOpenDesactivar] = useState(false);
  const [usuarioDesactivar, setUsuarioDesactivar] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(usuarioSchema),
    defaultValues: {
      EsNuevo: true,
      NombreCompleto: "",
      Correo: "",
      Contrasena: "",
      Direccion: "",
      IdRol: "",
      Activo: 1,
    },
  });

  useEffect(() => {
    if (!esAdministrador) return;

    cargarUsuarios();
    cargarRoles();
  }, [esAdministrador]);

  const cargarUsuarios = async () => {
    try {
      const response = await UsuarioService.getUsuarios();
      setUsuarios(response.data?.usuarios || []);
    } catch (error) {
      console.error("Error cargando usuarios", error);
      toast.error(t("users.messages.loadError"));
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await UsuarioService.getRoles();
      setRoles(response.data?.roles || []);
    } catch (error) {
      console.error("Error cargando roles", error);
    }
  };

  const abrirNuevo = () => {
    setUsuarioSeleccionado(null);
    reset({
      EsNuevo: true,
      NombreCompleto: "",
      Correo: "",
      Contrasena: "",
      Direccion: "",
      IdRol: "",
      Activo: 1,
    });
    setOpen(true);
  };

  const abrirEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    reset({
      EsNuevo: false,
      NombreCompleto: usuario.NombreCompleto,
      Correo: usuario.Correo,
      Contrasena: "",
      Direccion: usuario.Direccion || "",
      IdRol: usuario.IdRol,
      Activo: usuario.Activo,
    });
    setOpen(true);
  };

  const guardar = async (formData) => {
    try {
      if (usuarioSeleccionado) {
        await UsuarioService.update(usuarioSeleccionado.IdUsuario, formData);
        toast.success(t("users.messages.updated"));
      } else {
        await UsuarioService.create(formData);
        toast.success(t("users.messages.created"));
      }

      setOpen(false);
      setUsuarioSeleccionado(null);
      cargarUsuarios();
    } catch (error) {
      const mensaje =
        error.response?.status === 409
          ? t("users.messages.duplicateEmail")
          : error.response?.data?.result || t("users.messages.saveError");

      toast.error(mensaje);
    }
  };

  const confirmarDesactivar = (usuario) => {
    setUsuarioDesactivar(usuario);
    setOpenDesactivar(true);
  };

  const desactivar = async () => {
    try {
      await UsuarioService.delete(usuarioDesactivar.IdUsuario);
      toast.success(t("users.messages.deleted"));

      setOpenDesactivar(false);
      setUsuarioDesactivar(null);
      cargarUsuarios();
    } catch (error) {
      console.error("Error desactivando usuario", error);
      toast.error(t("users.messages.deleteError"));
    }
  };

  if (!esAdministrador) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>{t("orders.mustLogin")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mb: 3 }}>
        {t("users.title")}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirNuevo}
          sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#E67E00" } }}
        >
          {t("users.new")}
        </Button>
      </Box>

      {usuarios.length === 0 ? (
        <Typography align="center" sx={{ color: "text.secondary", py: 4 }}>
          {t("users.noUsers")}
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("users.columnName")}</TableCell>
              <TableCell>{t("users.columnEmail")}</TableCell>
              <TableCell>{t("users.columnRole")}</TableCell>
              <TableCell>{t("users.columnStatus")}</TableCell>
              <TableCell align="center">{t("users.columnActions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.IdUsuario} hover>
                <TableCell>{usuario.NombreCompleto}</TableCell>
                <TableCell>{usuario.Correo}</TableCell>
                <TableCell>{usuario.NombreRol}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={usuario.Activo ? t("users.active") : t("users.inactive")}
                    color={usuario.Activo ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton sx={{ color: "#FF8C00" }} onClick={() => abrirEditar(usuario)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    disabled={!usuario.Activo}
                    onClick={() => confirmarDesactivar(usuario)}
                  >
                    <BlockIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Alta / edición de usuario */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {usuarioSeleccionado ? t("users.edit") : t("users.new")}
        </DialogTitle>

        <DialogContent>
          <Controller
            name="NombreCompleto"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label={t("users.fieldName")}
                error={!!errors.NombreCompleto}
                helperText={errors.NombreCompleto?.message}
              />
            )}
          />

          <Controller
            name="Correo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                label={t("users.fieldEmail")}
                error={!!errors.Correo}
                helperText={errors.Correo?.message}
              />
            )}
          />

          <Controller
            name="Contrasena"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                margin="dense"
                type="password"
                label={
                  usuarioSeleccionado
                    ? t("users.fieldPasswordEdit")
                    : t("users.fieldPassword")
                }
                error={!!errors.Contrasena}
                helperText={errors.Contrasena?.message}
              />
            )}
          />

          <Controller
            name="Direccion"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth margin="dense" label={t("users.fieldAddress")} />
            )}
          />

          <Controller
            name="IdRol"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                margin="dense"
                label={t("users.fieldRole")}
                error={!!errors.IdRol}
                helperText={errors.IdRol?.message}
              >
                {roles.map((r) => (
                  <MenuItem key={r.IdRol} value={r.IdRol}>
                    {r.NombreRol}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {usuarioSeleccionado && (
            <Controller
              name="Activo"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  sx={{ mt: 1 }}
                  control={
                    <Switch
                      checked={!!field.value}
                      onChange={(event) => field.onChange(event.target.checked ? 1 : 0)}
                    />
                  }
                  label={t("users.fieldActive")}
                />
              )}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>

          <Button
            variant="contained"
            onClick={handleSubmit(guardar)}
            sx={{ bgcolor: "#FF8C00", "&:hover": { bgcolor: "#E67E00" } }}
          >
            {usuarioSeleccionado ? t("actions.update") : t("actions.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación de desactivación */}
      <Dialog open={openDesactivar} onClose={() => setOpenDesactivar(false)}>
        <DialogTitle>{t("users.confirmDeleteTitle")}</DialogTitle>

        <DialogContent>
          <Typography>
            {t("users.confirmDeleteMessage")}: <b>{usuarioDesactivar?.NombreCompleto}</b>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenDesactivar(false);
              setUsuarioDesactivar(null);
            }}
          >
            {t("actions.cancel")}
          </Button>

          <Button variant="contained" color="error" onClick={desactivar}>
            {t("actions.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
