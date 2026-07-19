import React from "react";
import { useNavigate } from "react-router-dom";

import { Box, Container, Typography, Paper, Grid, Button } from "@mui/material";

import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EggAltOutlinedIcon from "@mui/icons-material/EggAltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const API_URL = "http://localhost:81/apirutaurbana";

export function Home() {
  const navigate = useNavigate();

  const secciones = [
    {
      titulo: "Productos",
      descripcion:
        "Descubre hamburguesas, entradas, bebidas y postres preparados con el auténtico sabor urbano.",
      icono: <LunchDiningOutlinedIcon />,
      ruta: "/productos",
    },
    {
      titulo: "Combos",
      descripcion:
        "Encuentra combinaciones pensadas para compartir, disfrutar y vivir una experiencia completa.",
      icono: <FastfoodOutlinedIcon />,
      ruta: "/combos",
    },
    {
      titulo: "Menús",
      descripcion:
        "Consulta las opciones disponibles según el horario, el día y la temporada.",
      icono: <MenuBookOutlinedIcon />,
      ruta: "/menu",
    },
    {
      titulo: "Ingredientes",
      descripcion:
        "Conoce y administra los ingredientes que forman parte de cada preparación.",
      icono: <EggAltOutlinedIcon />,
      ruta: "/ingrediente",
    },
  ];

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",

        background:
          "linear-gradient(135deg, #090909 0%, #151515 48%, #2b1605 100%)",

        color: "white",
        overflowX: "hidden",
      }}
    >

      <Box
        sx={{
          width: "100%",
          minHeight: {
            xs: "auto",
            md: "82vh",
          },
          display: "flex",
          alignItems: "center",
          py: {
            xs: 6,
            md: 8,
          },
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 430,
            height: 430,
            borderRadius: "50%",
            bgcolor: "rgba(255,122,0,0.11)",
            top: -140,
            right: -120,
            filter: "blur(2px)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            bgcolor: "rgba(255,122,0,0.07)",
            bottom: -120,
            left: -90,
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Grid container spacing={6} alignItems="center">

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  mb: 3,
                  borderRadius: 10,
                  bgcolor: "rgba(255,122,0,0.15)",
                  border: "1px solid rgba(255,122,0,0.45)",
                }}
              >
                <LocalShippingOutlinedIcon
                  sx={{
                    color: "#ff7a00",
                  }}
                />

                <Typography
                  sx={{
                    color: "#ffb366",
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  FOOD TRUCK 
                </Typography>
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "3rem",
                    sm: "4rem",
                    md: "5rem",
                  },
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Ruta
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "#ff7a00",
                  }}
                >
                  Urbana
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  fontSize: {
                    xs: "1.35rem",
                    md: "1.7rem",
                  },
                  fontWeight: 700,
                  color: "#f5f5f5",
                }}
              >
                El sabor de la ciudad en cada parada
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 650,
                  color: "#c7c7c7",
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                }}
              >
                Ruta Urbana es una experiencia gastronómica inspirada en el
                movimiento, la energía y los sabores de la ciudad. Nuestro food
                truck combina hamburguesas, entradas, bebidas y combos
                especiales en un concepto moderno, dinámico y lleno de sabor.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/productos")}
                  sx={{
                    bgcolor: "#ff7a00",
                    color: "white",
                    px: 4,
                    py: 1.4,
                    borderRadius: 10,
                    fontWeight: "bold",
                    fontSize: "1rem",
                    textTransform: "none",
                    boxShadow: "0 8px 25px rgba(255,122,0,.35)",
                    transition: ".3s",

                    "&:hover": {
                      bgcolor: "#ff8c1a",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Explorar productos
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/menu")}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,.55)",
                    px: 4,
                    py: 1.4,
                    borderRadius: 10,
                    fontWeight: "bold",
                    fontSize: "1rem",
                    textTransform: "none",
                    transition: ".3s",

                    "&:hover": {
                      borderColor: "#ff7a00",
                      color: "#ff7a00",
                      bgcolor: "rgba(255,122,0,.08)",
                    },
                  }}
                >
                  Ver menús
                </Button>
              </Box>
            </Grid>

            {/* IMAGEN */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: {
                      xs: 20,
                      md: 40,
                    },
                    borderRadius: 8,
                    bgcolor: "#ff7a00",
                    transform: "rotate(-4deg)",
                    opacity: 0.6,
                  }}
                />

                <Box
                  component="img"
                  src={`${API_URL}/uploads/ImagenesRutaUrbana/Logo.jpg`}
                  alt="Food truck Ruta Urbana"
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 650,
                    height: {
                      xs: 350,
                      sm: 470,
                      md: 560,
                    },
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "5px solid #ff7a00",
                    boxShadow: "0 25px 60px rgba(0,0,0,.65)",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* NUESTRA ESENCIA */}

      <Container
        maxWidth="lg"
        sx={{
          py: 10,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 6,
          }}
        >
          <Typography
            sx={{
              color: "#ff7a00",
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Nuestra esencia
          </Typography>

          <Typography
            variant="h3"
            sx={{
              mt: 1,
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            Sabor urbano sobre ruedas
          </Typography>

          <Typography
            sx={{
              mt: 2,
              maxWidth: 750,
              mx: "auto",
              color: "#c2c2c2",
              fontSize: "1.1rem",
              lineHeight: 1.8,
            }}
          >
            Cada preparación de Ruta Urbana representa una parada diferente:
            ingredientes frescos, combinaciones originales y una propuesta
            gastronómica creada para quienes disfrutan descubrir nuevos sabores.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {secciones.map((seccion) => (
            <Grid
              key={seccion.titulo}
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
              sx={{
                display: "flex",
              }}
            >
              <Paper
                elevation={0}
                onClick={() => navigate(seccion.ruta)}
                sx={{
                  width: "100%",
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  borderRadius: 4,
                  bgcolor: "rgba(27,27,27,.92)",
                  color: "white",
                  border: "1px solid rgba(255,122,0,.18)",
                  cursor: "pointer",
                  transition: "all .3s ease",
                  backdropFilter: "blur(5px)",

                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 18px 40px rgba(0,0,0,.55)",
                    borderColor: "#ff7a00",
                    bgcolor: "#242424",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 85,
                    height: 85,
                    mx: "auto",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "rgba(255,122,0,.14)",
                    border: "1px solid rgba(255,122,0,.3)",
                    color: "#ff7a00",

                    "& .MuiSvgIcon-root": {
                      fontSize: 48,
                    },
                  }}
                >
                  {seccion.icono}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {seccion.titulo}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#bdbdbd",
                    lineHeight: 1.7,
                  }}
                >
                  {seccion.descripcion}
                </Typography>

                <Typography
                  sx={{
                    mt: "auto",
                    pt: 2,
                    color: "#ff7a00",
                    fontWeight: 700,
                    letterSpacing: 1,
                    transition: ".3s",
                  }}
                >
                  Explorar →
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FRASE FINAL */}

      <Box
        sx={{
          width: "100%",
          py: 8,
          px: 2,
          textAlign: "center",
          borderTop: "1px solid rgba(255,122,0,.3)",
          background:
            "linear-gradient(180deg, rgba(17,17,17,.35), rgba(43,22,5,.65))",
        }}
      >
        <LocalShippingOutlinedIcon
          sx={{
            fontSize: 58,
            color: "#ff7a00",
          }}
        />

        <Typography
          variant="h4"
          sx={{
            mt: 2,
            fontWeight: 900,
            color: "white",
          }}
        >
          Más que comida rápida
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "#bdbdbd",
            fontSize: "1.15rem",
          }}
        >
          Llevamos el sabor de la ciudad a cada cliente.
        </Typography>
      </Box>
    </Box>
  );
}
