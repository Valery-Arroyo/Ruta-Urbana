import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Alert,
} from "@mui/material";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

import PedidoService from "../../services/PedidoService";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const { rol, isAuthenticated } = useAuth();

  const [productos, setProductos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const tieneAcceso = rol === ROLES.ADMINISTRADOR || rol === ROLES.ENCARGADO;

  useEffect(() => {
    if (!isAuthenticated || !tieneAcceso) {
      return;
    }

    const cargarDashboard = async () => {
      try {
        setCargando(true);
        setError("");

        const response = await PedidoService.getDashboard();

        setProductos(response.data.productosMasPedidos || []);
        setEstados(response.data.pedidosPorEstado || []);
      } catch (err) {
        console.error("Error al cargar el dashboard:", err);

        setError(
          err.response?.data?.result ||
            "No se pudo cargar la información del tablero.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, [isAuthenticated, tieneAcceso]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!tieneAcceso) {
    return <Navigate to="/home" replace />;
  }

  const datosProductos = {
    labels: productos.map((producto) => producto.Nombre),
    datasets: [
      {
        label: "Cantidad pedida",
        data: productos.map((producto) => Number(producto.CantidadPedidos)),
        backgroundColor: [
          "rgba(255, 122, 0, 0.85)",
          "rgba(255, 152, 50, 0.85)",
          "rgba(255, 183, 100, 0.85)",
        ],
        borderColor: [
          "rgb(255, 122, 0)",
          "rgb(255, 152, 50)",
          "rgb(255, 183, 100)",
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const datosEstados = {
    labels: estados.map((estado) => estado.Nombre),
    datasets: [
      {
        label: "Pedidos",
        data: estados.map((estado) => Number(estado.CantidadPedidos)),
        backgroundColor: [
          "#ff7a00",
          "#ff9a3c",
          "#ffc078",
          "#555555",
          "#1f1f1f",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const opcionesProductos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        title: {
          display: true,
          text: "Cantidad pedida",
        },
      },
    },
  };

  const opcionesEstados = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 88px)",
        bgcolor: "#f5f5f5",
        py: 5,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#111",
              mb: 1,
            }}
          >
            Tablero de control
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#666",
              fontWeight: 400,
            }}
          >
            Resumen de pedidos correspondiente a la fecha actual
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {cargando ? (
          <Box
            sx={{
              minHeight: 350,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ color: "#ff7a00" }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 4,
                  height: "100%",
                  borderTop: "5px solid #ff7a00",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    Productos más pedidos
                  </Typography>

                  <Typography
                    sx={{
                      color: "#777",
                      mb: 3,
                    }}
                  >
                    Tres productos con mayor cantidad solicitada hoy
                  </Typography>

                  {productos.length === 0 ? (
                    <Box
                      sx={{
                        height: 350,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No hay productos pedidos durante el día de hoy.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ height: 350 }}>
                      <Bar data={datosProductos} options={opcionesProductos} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 4,
                  height: "100%",
                  borderTop: "5px solid #111",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    Pedidos por estado
                  </Typography>

                  <Typography
                    sx={{
                      color: "#777",
                      mb: 3,
                    }}
                  >
                    Distribución de los pedidos registrados hoy
                  </Typography>

                  <Box sx={{ height: 350 }}>
                    <Doughnut data={datosEstados} options={opcionesEstados} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
