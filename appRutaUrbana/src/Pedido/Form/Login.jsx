import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Box, Card, Typography, TextField, Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

const loginSchema = yup.object().shape({
  Correo: yup
    .string()
    .transform((value) => value?.trim())
    .email("Correo inválido")
    .required("El correo es requerido"),
  Contrasena: yup.string().required("La contraseña es requerida"),
});

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [enviando, setEnviando] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { Correo: "", Contrasena: "" },
  });

  const onSubmit = async (formData) => {
    setEnviando(true);

    try {
      const usuarioAutenticado = await login(
        formData.Correo,
        formData.Contrasena,
      );

      toast.success(
        t("auth.messages.welcome", {
          nombre: usuarioAutenticado.NombreCompleto,
        }),
      );

      if (
        usuarioAutenticado.NombreRol === ROLES.ADMINISTRADOR ||
        usuarioAutenticado.NombreRol === ROLES.ENCARGADO
      ) {
        navigate("/pedidos/historial");
      } else {
        navigate("/pedidos/nuevo");
      }
    } catch (error) {
      const mensaje =
        error.response?.data?.result || t("auth.messages.loginError");

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
        p: 2,
        background:
          "linear-gradient(135deg, #090909 0%, #151515 48%, #2b1605 100%)",
      }}
    >
      <Card
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
          bgcolor: "#111111",
          border: "1px solid rgba(255,122,0,.35)",
          boxShadow: "0 20px 45px rgba(0,0,0,.55)",
        }}
      >
        <Typography align="center" sx={{ fontSize: 44, mb: 1 }}>
          🍔
        </Typography>

        <Typography
          variant="h5"
          align="center"
          sx={{ color: "white", fontWeight: 800, mb: 3 }}
        >
          {t("auth.loginTitle")}
        </Typography>

        <Controller
          name="Correo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              margin="normal"
              label={t("auth.email")}
              error={!!errors.Correo}
              helperText={errors.Correo?.message}
              slotProps={{
                inputLabel: { sx: { color: "rgba(255,255,255,.7)" } },
              }}
              sx={{
                input: { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,122,0,.4)",
                },
              }}
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
              type="password"
              margin="normal"
              label={t("auth.password")}
              error={!!errors.Contrasena}
              helperText={errors.Contrasena?.message}
              slotProps={{
                inputLabel: { sx: { color: "rgba(255,255,255,.7)" } },
              }}
              sx={{
                input: { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,122,0,.4)",
                },
              }}
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          disabled={enviando}
          startIcon={<LoginIcon />}
          sx={{
            mt: 3,
            py: 1.3,
            bgcolor: "#ff7a00",
            color: "white",
            fontWeight: "bold",
            borderRadius: "30px",
            textTransform: "none",
            "&:hover": { bgcolor: "#ff8c1a" },
          }}
        >
          {enviando ? t("auth.loggingIn") : t("auth.loginButton")}
        </Button>

        <Button
          fullWidth
          type="button"
          onClick={() => navigate("/registro")}
          sx={{
            mt: 1.5,
            color: "#ff7a00",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          ¿No tiene una cuenta? Regístrese
        </Button>
      </Card>
    </Box>
  );
}
