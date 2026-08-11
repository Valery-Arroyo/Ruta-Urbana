// eslint-disable-next-line no-unused-vars
import * as React from "react";

import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Divider,
  Badge,
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import EggAltOutlinedIcon from "@mui/icons-material/EggAltOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";

import LanguageSelector from "../LanguageSelector";
import { useAuth } from "../../context/AuthContext";
import { usePedidoEnCurso } from "../../context/PedidoEnCursoContext";
import { ROLES } from "../../utils/constants";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario, rol, isAuthenticated, logout } = useAuth();
  const { cantidadTotal } = usePedidoEnCurso();

  const esAdministrador = rol === ROLES.ADMINISTRADOR;
  const esGestor = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;

  // El catálogo (Productos, Combos, Menús) lo ve cualquiera, incluso sin
  // iniciar sesión. Las herramientas de administración de cocina/inventario
  // (Tabla de productos, Procesos, Ingredientes) solo las ve el personal.
  const menu = [
    {
      nombre: t("navigation.products"),
      ruta: "/productos",
      icono: <LunchDiningOutlinedIcon />,
    },
    {
      nombre: t("navigation.combos"),
      ruta: "/combos",
      icono: <FastfoodOutlinedIcon />,
    },
    {
      nombre: t("navigation.menus"),
      ruta: "/menu",
      icono: <MenuBookOutlinedIcon />,
    },
  ];

  if (esGestor) {
    menu.push(
      {
        nombre: t("navigation.productTable"),
        ruta: "/tabla",
        icono: <AssignmentOutlinedIcon />,
      },
      {
        nombre: t("navigation.processes"),
        ruta: "/preparacion",
        icono: <SettingsOutlinedIcon />,
      },
      {
        nombre: t("navigation.ingredients"),
        ruta: "/ingrediente",
        icono: <EggAltOutlinedIcon />,
      },
      {
        nombre: t("navigation.stations"),
        ruta: "/pedidos/estaciones",
        icono: <SoupKitchenOutlinedIcon />,
      },
    );
  }

  menu.push({
    nombre: t("navigation.home"),
    ruta: "/home",
    icono: <HomeOutlinedIcon />,
  });

  if (isAuthenticated) {
    menu.push(
      {
        nombre: t("navigation.newOrder"),
        ruta: "/pedidos/nuevo",
        icono: (
          <Badge badgeContent={cantidadTotal} color="error">
            <ShoppingCartOutlinedIcon />
          </Badge>
        ),
      },
      {
        nombre: t("navigation.orderHistory"),
        ruta: "/pedidos/historial",
        icono: <ReceiptLongOutlinedIcon />,
      },
    );
  }

  if (esAdministrador) {
    menu.push({
      nombre: t("navigation.userManagement"),
      ruta: "/usuarios",
      icono: <ManageAccountsOutlinedIcon />,
    });
  }

  const cerrarSesion = () => {
    logout();
    navigate("/home");
  };

  return (
    <AppBar
      position="static"
      elevation={8}
      sx={{
        width: "100%",
        m: 0,
        background: "linear-gradient(90deg,#111,#181818)",
        borderBottom: "4px solid #ff7a00",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: "88px !important",
          height: 88,
          width: "100%",
          px: 3,
          display: "flex",
          bgcolor: "transparent",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 250,
            mr: 5,
          }}
        >
          <Typography
            sx={{
              fontSize: 40,
              mr: 2,
            }}
          >
            🍔
          </Typography>

          <Typography
            sx={{
              color: "#ff7a00",
              fontWeight: "bold",
              fontSize: 20,
              letterSpacing: 2,
            }}
          >
            RUTA URBANA
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          {menu.map((item, index) => (
            <React.Fragment key={item.ruta}>
              <Button
                component={Link}
                to={item.ruta}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  color: "white",
                  textTransform: "none",
                  minWidth: 120,
                  px: 3,
                  py: 1,

                  "& .MuiSvgIcon-root": {
                    color: "#ff7a00",
                    fontSize: 34,
                    mb: 0.5,
                  },

                  "&:hover": {
                    backgroundColor: "transparent",
                  },

                  "&:hover .MuiSvgIcon-root": {
                    transform: "translateY(-3px)",
                    transition: ".3s",
                  },

                  "&::after": {
                    content: '""',
                    marginTop: "8px",
                    width: 0,
                    height: "3px",
                    background: "#ff7a00",
                    transition: ".3s",
                  },

                  "&:hover::after": {
                    width: "75%",
                  },
                }}
              >
                {item.icono}

                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {item.nombre}
                </Typography>
              </Button>

              {index !== menu.length - 1 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    mx: 1.5,
                    borderColor: "#3b3b3b",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>

        <Box
          sx={{
            mr: 2,
            minWidth: 130,

            // Texto seleccionado: English / Español
            "& .MuiSelect-select": {
              color: "#ff7a00 !important",
            },

            // Borde normal
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ff7a00 !important",
            },

            // Borde al pasar el mouse
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ff8c1a !important",
            },

            // Borde cuando está seleccionado
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#ff7a00 !important",
                borderWidth: "2px",
              },

            // Texto del label: Language
            "& .MuiInputLabel-root": {
              color: "#ff7a00 !important",
            },

            // Label cuando está seleccionado
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#ff7a00 !important",
            },

            // Flecha del selector
            "& .MuiSelect-icon": {
              color: "#ff7a00 !important",
            },
          }}
        >
          <LanguageSelector />
        </Box>

        {isAuthenticated ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              sx={{ color: "white", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {usuario?.NombreCompleto}
            </Typography>

            <Button
              onClick={cerrarSesion}
              startIcon={<LogoutIcon />}
              variant="outlined"
              sx={{
                borderColor: "#ff7a00",
                color: "#ff7a00",
                borderRadius: "30px",
                px: 3,
                py: 1,
                fontWeight: "bold",
                whiteSpace: "nowrap",

                "&:hover": {
                  borderColor: "#ff8c1a",
                  backgroundColor: "rgba(255,122,0,.1)",
                },
              }}
            >
              {t("actions.logout")}
            </Button>
          </Box>
        ) : (
          <Button
            component={Link}
            to="/login"
            startIcon={<PersonIcon />}
            variant="contained"
            sx={{
              bgcolor: "#ff7a00",
              color: "white",
              borderRadius: "30px",
              px: 4,
              py: 1.2,
              fontWeight: "bold",
              boxShadow: "0 5px 18px rgba(255,122,0,.4)",
              whiteSpace: "nowrap",

              "&:hover": {
                bgcolor: "#ff8c1a",
                transform: "translateY(-2px)",
                transition: ".3s",
              },
            }}
          >
            {t("actions.login")}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
