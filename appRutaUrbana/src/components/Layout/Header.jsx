// eslint-disable-next-line no-unused-vars
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Icono menú */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={Link} to="/productos">
              Productos
            </Button>
            <Button color="inherit" component={Link} to="/combos">
              Combos
            </Button>
            <Button color="inherit" component={Link} to="/menu">
              Menús
            </Button>
            <Button color="inherit" component={Link} to="/tabla">
              Tabla Productos
            </Button>
            <Button color="inherit" component={Link} to="/preparacion">
              Preparaciones
            </Button>
          </Box>
          <Box sx={{ flexGrow: 1 }} /> {/* espacio flexible */}
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
