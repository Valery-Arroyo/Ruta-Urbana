// eslint-disable-next-line no-unused-vars
import * as React from "react";
import { useState } from "react";

import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Divider,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import LanguageSelector from "../LanguageSelector";
import { useAuth } from "../../context/AuthContext";
import { usePedidoEnCurso } from "../../context/PedidoEnCursoContext";
import { ROLES } from "../../utils/constants";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario, rol, isAuthenticated, logout } = useAuth();
  const { cantidadTotal } = usePedidoEnCurso();
  const [catalogoAnchor, setCatalogoAnchor] = useState(null);
  const [gestionAnchor, setGestionAnchor] = useState(null);

  const esAdministrador = rol === ROLES.ADMINISTRADOR;
  const esGestor = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;
  const esCocina = rol === ROLES.COCINA;

  // Mismas condiciones de antes (esGestor / esAdministrador / isAuthenticated),
  // solo que ahora se agrupan en 3 listas en vez de una sola, para poder
  // mostrarlas como menús desplegables y que la barra no se sature.

  // El catálogo lo ve cualquiera, incluso sin iniciar sesión.
  const catalogoItems = [
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

  // Herramientas de administración de cocina/inventario/usuarios: solo personal.
  const gestionItems = [];

  if (esGestor) {
    gestionItems.push(
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
    );
  }

  if (esAdministrador) {
    gestionItems.push({
      nombre: t("navigation.userManagement"),
      ruta: "/usuarios",
      icono: <ManageAccountsOutlinedIcon />,
    });
  }

  // Los de uso diario quedan sueltos, visibles siempre en la barra.
  const itemsDirectos = [
    {
      nombre: t("navigation.home"),
      ruta: "/home",
      icono: <HomeOutlinedIcon />,
    },
  ];

  // Cocina nunca registra pedidos ("Nuevo pedido" no aplica), pero sí
  // debe poder ver los que ya existen ("Historial") y trabajar sus
  // líneas ("Estaciones"), su única herramienta del día a día.
  if (isAuthenticated && !esCocina) {
    itemsDirectos.push({
      nombre: t("navigation.newOrder"),
      ruta: "/pedidos/nuevo",
      icono: (
        <Badge badgeContent={cantidadTotal} color="error">
          <ShoppingCartOutlinedIcon />
        </Badge>
      ),
    });
  }

  if (esCocina) {
    itemsDirectos.push({
      nombre: t("navigation.stations"),
      ruta: "/pedidos/estaciones",
      icono: <SoupKitchenOutlinedIcon />,
    });
  }

  if (isAuthenticated) {
    itemsDirectos.push({
      nombre: t("navigation.orderHistory"),
      ruta: "/pedidos/historial",
      icono: <ReceiptLongOutlinedIcon />,
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
          {/*
           * Estilo compartido por los botones sueltos y por los botones que
           * abren un desplegable (Catálogo / Gestión). Se separó del JSX de
           * abajo para no repetirlo dos veces.
           */}
          {(() => {
            const estiloBoton = {
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
            };

            // Los items sueltos van directo a su ruta. Los desplegables
            // (Catálogo, Gestión) agrupan varias rutas bajo un solo botón.
            // Cocina no vende ni atiende catálogo: su barra queda en
            // Inicio, Estaciones e Historial únicamente.
            const bloques = [
              !esCocina && {
                tipo: "desplegable",
                key: "catalogo",
                nombre: t("navigation.catalog"),
                icono: <MenuBookOutlinedIcon />,
                items: catalogoItems,
                anchor: catalogoAnchor,
                abrir: (e) => setCatalogoAnchor(e.currentTarget),
                cerrar: () => setCatalogoAnchor(null),
              },
              ...itemsDirectos.map((item) => ({
                tipo: "link",
                key: item.ruta,
                ...item,
              })),
              gestionItems.length > 0 && {
                tipo: "desplegable",
                key: "gestion",
                nombre: t("navigation.management"),
                icono: <SettingsOutlinedIcon />,
                items: gestionItems,
                anchor: gestionAnchor,
                abrir: (e) => setGestionAnchor(e.currentTarget),
                cerrar: () => setGestionAnchor(null),
              },
            ].filter(Boolean);

            return bloques.map((bloque, index) => (
              <React.Fragment key={bloque.key}>
                {bloque.tipo === "link" ? (
                  <Button component={Link} to={bloque.ruta} sx={estiloBoton}>
                    {bloque.icono}
                    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                      {bloque.nombre}
                    </Typography>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={bloque.abrir}
                      sx={estiloBoton}
                      endIcon={
                        <KeyboardArrowDownIcon
                          sx={{ fontSize: "20px !important", mb: "4px !important" }}
                        />
                      }
                    >
                      {bloque.icono}
                      <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                        {bloque.nombre}
                      </Typography>
                    </Button>

                    <Menu
                      anchorEl={bloque.anchor}
                      open={Boolean(bloque.anchor)}
                      onClose={bloque.cerrar}
                    >
                      {bloque.items.map((item) => (
                        <MenuItem
                          key={item.ruta}
                          component={Link}
                          to={item.ruta}
                          onClick={bloque.cerrar}
                        >
                          <ListItemIcon sx={{ color: "#ff7a00" }}>
                            {item.icono}
                          </ListItemIcon>
                          <ListItemText>{item.nombre}</ListItemText>
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}

                {index !== bloques.length - 1 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ mx: 1.5, borderColor: "#3b3b3b" }}
                  />
                )}
              </React.Fragment>
            ));
          })()}
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
