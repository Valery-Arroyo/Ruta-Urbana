import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PreparacionService from "../../services/PreparacionService";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DetallePreparacion() {
  // Obtenemos el ID de la preparación desde los parámetros de la URL
  const { id } = useParams();

  // Inicializamos el hook de navegación
  const navigate = useNavigate();
  
  // Estado para almacenar los datos de la preparación y el estado de carga
  const [data, setData] = useState(null);
  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);

  // Efecto para obtener los datos de la preparación al montar el componente
  useEffect(() => {
    // Llamada al servicio para obtener el proceso de preparación por ID
    PreparacionService.getProcesoPreparacion(id)
      .then((response) => {
        if (response.data && response.data.length > 0) {
          const primerRegistro = response.data[0];
          
          const preparacionEstructurada = {
            Nombre: primerRegistro.NombreProducto || primerRegistro.NombreCombo,
            Imagen: primerRegistro.RutaImagen || primerRegistro.Imagen || null,
            pasos: response.data.map(item => ({
              OrdenPaso: item.OrdenPaso,
              NombreEstacion: item.NombreEstacion,
              TiempoEstimadoMinutos: item.TiempoEstimadoMinutos
            })).sort((a, b) => a.OrdenPaso - b.OrdenPaso)
          };
          
          setData(preparacionEstructurada);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log("====== ERROR DE CONFIGURACIÓN ======");
        if (error.config) {
          console.log("URL de la petición fallida:", error.config.url);
          console.log("Método HTTP:", error.config.method?.toUpperCase());
        }
        
        if (error.response) {
          console.log("Código de estado HTTP (Status):", error.response.status);
          console.log("Datos devueltos por el backend:", error.response.data);
        } else if (error.request) {
          console.log("No se recibió respuesta del servidor. Solicitud efectuada:", error.request);
        } else {
          console.log("Mensaje de error:", error.message);
        }
        console.log("====================================");

        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">Proceso de preparación no encontrado.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/preparacion")} sx={{ mt: 2 }}>
          Volver a Preparaciones
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
      <Card sx={{ maxWidth: 700, width: "100%", p: 3, boxShadow: 4 }}>
        
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate("/preparacion")} 
          sx={{ mb: 2 }}
          color="black"
        >
          Volver
        </Button>

        {data.Imagen && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <CardMedia
              component="img"
              image={`http://localhost:81/apirutaurbana/${data.Imagen}`}
              alt={data.Nombre}
              sx={{
                width: "100%",
                maxHeight: 350,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          </Box>
        )}

        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 3 }}>
          {data.Nombre}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Flujo de Preparación por Pasos
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.pasos.map((paso, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                p: 2, 
                borderRadius: 1, 
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: 1
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", minWidth: 70 }}>
                  Paso {paso.OrdenPaso}
                </Typography>
                <Chip 
                  label={paso.NombreEstacion} 
                  color="primary" 
                  variant="contained" 
                  size="small" 
                />
              </Box>

              {paso.TiempoEstimadoMinutos && (
                <Chip 
                  label={`${paso.TiempoEstimadoMinutos} mins`} 
                  color="secondary" 
                  size="small" 
                />
              )}
            </Box>
          ))}
        </Box>

      </Card>
    </Box>
  );
}