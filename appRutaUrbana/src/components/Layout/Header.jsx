// eslint-disable-next-line no-unused-vars
import * as React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Divider,
} from "@mui/material";

import { Link } from "react-router-dom";

import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonIcon from "@mui/icons-material/Person";

const menu = [
  {
    nombre: "Productos",
    ruta: "/productos",
    icono: <LunchDiningOutlinedIcon />,
  },
  {
    nombre: "Combos",
    ruta: "/combos",
    icono: <FastfoodOutlinedIcon />,
  },
  {
    nombre: "Menús",
    ruta: "/menu",
    icono: <MenuBookOutlinedIcon />,
  },
  {
    nombre: "Tabla Productos",
    ruta: "/tabla",
    icono: <AssignmentOutlinedIcon />,
  },
  {
    nombre: "Procesos",
    ruta: "/preparacion",
    icono: <SettingsOutlinedIcon />,
  },
    {
    nombre: "Ingrediente",
    ruta: "/ingrediente",
    icono: <SettingsOutlinedIcon />,
  },
];

export default function Header() {
  return (
    <AppBar
      position="static"
      elevation={8}
      sx={{
        background: "linear-gradient(90deg,#111,#181818)",
        borderBottom: "4px solid #ff7a00",
      }}
    >
      <Toolbar
        sx={{
          height: 88,
          display: "flex",
        }}
      >
        {/* Logo */}

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

        {/* Menú */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          {menu.map((item, index) => (
            <React.Fragment key={item.nombre}>
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

        {/* Login */}

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

            "&:hover": {
              bgcolor: "#ff8c1a",
              transform: "translateY(-2px)",
              transition: ".3s",
            },
          }}
        >
          INICIAR SESIÓN
        </Button>
      </Toolbar>
    </AppBar>
  );
}
