// eslint-disable-next-line no-unused-vars
import React from "react";

import { Box, Container, Grid, Typography, Divider } from "@mui/material";

import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        m: 0,
        mt: 0,
        background: "linear-gradient(90deg,#111,#181818)",
        borderTop: "4px solid #ff7a00",
        color: "white",
        pt: 4,
        pb: 2,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          bgcolor: "transparent",
        }}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1,
              }}
            >
              <Typography sx={{ fontSize: 36 }}>🍔</Typography>

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

            <Typography
              variant="body2"
              sx={{
                color: "#bdbdbd",
              }}
            >
              El sabor de la ciudad.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1.5,
              }}
            >
              <CodeOutlinedIcon
                sx={{
                  color: "#ff7a00",
                  fontSize: 22,
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: "#ff7a00",
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                DESARROLLADORES
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "#c7c7c7",
              }}
            >
              Valery Arroyo Barrantes
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#c7c7c7",
              }}
            >
              Isaac Acuña Araya
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1.5,
              }}
            >
              <SchoolOutlinedIcon
                sx={{
                  color: "#ff7a00",
                  fontSize: 18,
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: "#9e9e9e",
                }}
              >
                ISW-613 · Universidad Técnica Nacional
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider
          sx={{
            borderColor: "#3b3b3b",
            mt: 3,
            mb: 2,
          }}
        />

        <Typography
          variant="caption"
          align="center"
          display="block"
          sx={{
            color: "#757575",
          }}
        >
          &copy; {new Date().getFullYear()} Ruta Urbana. Todos los derechos
          reservados.
        </Typography>
      </Container>
    </Box>
  );
}
