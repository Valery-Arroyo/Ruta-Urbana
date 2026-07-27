import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const secciones = [
    {
      titulo: t("home.sections.products.title"),
      descripcion: t("home.sections.products.description"),
      icono: <LunchDiningOutlinedIcon />,
      ruta: "/productos",
    },
    {
      titulo: t("home.sections.combos.title"),
      descripcion: t("home.sections.combos.description"),
      icono: <FastfoodOutlinedIcon />,
      ruta: "/combos",
    },
    {
      titulo: t("home.sections.menus.title"),
      descripcion: t("home.sections.menus.description"),
      icono: <MenuBookOutlinedIcon />,
      ruta: "/menu",
    },
    {
      titulo: t("home.sections.ingredients.title"),
      descripcion: t("home.sections.ingredients.description"),
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
                  {t("home.badge")}
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
                {t("home.tagline")}
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
                {t("home.description")}
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
                  {t("home.exploreProducts")}
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
                  {t("home.viewMenus")}
                </Button>
              </Box>
            </Grid>

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
                  alignItems: "center",
                  position: "relative",

                  width: {
                    xs: 350,
                    sm: 430,
                    md: 610,
                  },

                  height: {
                    xs: 350,
                    sm: 430,
                    md: 610,
                  },

                  maxWidth: "100%",
                  mx: "auto",
                }}
              >
                {/* Mancha naranja circular detrás del logo */}
                <Box
                  sx={{
                    position: "absolute",

                    width: {
                      xs: 305,
                      sm: 385,
                      md: 535,
                    },

                    height: {
                      xs: 305,
                      sm: 385,
                      md: 535,
                    },

                    borderRadius: "50%",
                    bgcolor: "rgba(255,122,0,0.48)",
                    boxShadow: "0 20px 55px rgba(255,122,0,0.22)",
                    zIndex: 0,
                  }}
                />

                {/* Contenedor circular principal */}
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,

                    width: {
                      xs: 320,
                      sm: 400,
                      md: 560,
                    },

                    height: {
                      xs: 320,
                      sm: 400,
                      md: 560,
                    },

                    borderRadius: "50%",
                    border: "4px solid #ff7a00",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "#0f0f0f",
                    boxShadow: "0 25px 60px rgba(0,0,0,.6)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={`${API_URL}/uploads/ImagenesRutaUrbana/logoMejorado.png`}
                    alt="Logo de Ruta Urbana"
                    sx={{
                      position: "relative",
                      zIndex: 2,
                      width: "88%",
                      height: "88%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

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
            {t("home.essenceLabel")}
          </Typography>

          <Typography
            variant="h3"
            sx={{
              mt: 1,
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            {t("home.essenceTitle")}
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
            {t("home.essenceDescription")}
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
                  {t("home.explore")}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

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
          {t("home.finalTitle")}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "#bdbdbd",
            fontSize: "1.15rem",
          }}
        >
          {t("home.finalSubtitle")}
        </Typography>
      </Box>
    </Box>
  );
}
