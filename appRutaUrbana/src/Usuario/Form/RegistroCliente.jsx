import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import UsuarioService from "../../services/UsuarioService";

// Validaciones del formulario
const registroSchema = yup.object().shape({
  NombreCompleto: yup
    .string()
    .transform((value) => value?.trim())
    .required("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),

  Correo: yup
    .string()
    .transform((value) => value?.trim())
    .email("Ingrese un correo electrónico válido")
    .required("El correo es requerido"),

  Direccion: yup
    .string()
    .transform((value) => value?.trim())
    .max(200, "La dirección no puede superar los 200 caracteres"),

  Contrasena: yup
    .string()
    .required("La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),

  ConfirmarContrasena: yup
    .string()
    .required("Debe confirmar la contraseña")
    .oneOf([yup.ref("Contrasena")], "Las contraseñas no coinciden"),
});

export default function RegistroCliente() {
  const navigate = useNavigate();

  const [enviando, setEnviando] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registroSchema),

    defaultValues: {
      NombreCompleto: "",
      Correo: "",
      Direccion: "",
      Contrasena: "",
      ConfirmarContrasena: "",
    },
  });

  const onSubmit = async (formData) => {
    setEnviando(true);

    try {
      const datos = {
        NombreCompleto: formData.NombreCompleto.trim(),
        Correo: formData.Correo.trim(),
        Direccion: formData.Direccion?.trim() || "",
        Contrasena: formData.Contrasena,
      };

      await UsuarioService.registro(datos);

      toast.success("Cuenta creada correctamente. Ya puede iniciar sesión.");

      navigate("/login");
    } catch (error) {
      console.error("Error al registrar cliente:", error);

      const mensaje =
        error.response?.data?.result || "No se pudo crear la cuenta";

      toast.error(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#0d0d0d",
        px: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 500,
          bgcolor: "#171717",
          color: "white",
          borderRadius: 4,
          border: "1px solid rgba(255, 140, 0, 0.35)",
          boxShadow: "0 15px 45px rgba(0, 0, 0, 0.5)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <PersonAddOutlinedIcon
              sx={{
                fontSize: 55,
                color: "#FF8C00",
              }}
            />
          </Box>

          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Crear cuenta
          </Typography>

          <Typography
            align="center"
            sx={{
              color: "rgba(255,255,255,0.65)",
              mb: 4,
            }}
          >
            Regístrese como cliente de Ruta Urbana
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Nombre */}
            <Controller
              name="NombreCompleto"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nombre completo"
                  margin="normal"
                  error={!!errors.NombreCompleto}
                  helperText={errors.NombreCompleto?.message}
                  sx={estiloCampo}
                />
              )}
            />

            {/* Correo */}
            <Controller
              name="Correo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="email"
                  label="Correo electrónico"
                  margin="normal"
                  error={!!errors.Correo}
                  helperText={errors.Correo?.message}
                  sx={estiloCampo}
                />
              )}
            />

            {/* Dirección */}
            <Controller
              name="Direccion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Dirección"
                  margin="normal"
                  multiline
                  rows={2}
                  error={!!errors.Direccion}
                  helperText={errors.Direccion?.message}
                  sx={estiloCampo}
                />
              )}
            />

            {/* Contraseña */}
            <Controller
              name="Contrasena"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label="Contraseña"
                  margin="normal"
                  autoComplete="new-password"
                  error={!!errors.Contrasena}
                  helperText={errors.Contrasena?.message}
                  sx={estiloCampo}
                />
              )}
            />

            {/* Confirmar contraseña */}
            <Controller
              name="ConfirmarContrasena"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label="Confirmar contraseña"
                  margin="normal"
                  autoComplete="new-password"
                  error={!!errors.ConfirmarContrasena}
                  helperText={errors.ConfirmarContrasena?.message}
                  sx={estiloCampo}
                />
              )}
            />

            {/* Registrar */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={enviando}
              startIcon={
                enviando ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <PersonAddOutlinedIcon />
                )
              }
              sx={{
                mt: 3,
                py: 1.3,
                bgcolor: "#FF8C00",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",

                "&:hover": {
                  bgcolor: "#E67E00",
                },
              }}
            >
              {enviando ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            {/* Volver */}
            <Button
              type="button"
              fullWidth
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate("/login")}
              sx={{
                mt: 1.5,
                color: "#FF8C00",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Volver a iniciar sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

const estiloCampo = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.65)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#FF8C00",
  },

  "& .MuiOutlinedInput-root": {
    color: "white",

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.25)",
    },

    "&:hover fieldset": {
      borderColor: "#FF8C00",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#FF8C00",
    },
  },

  "& .MuiFormHelperText-root": {
    marginLeft: 0,
  },
};
