import axios from "axios";

// Se define la URL base para las solicitudes relacionadas con preparaciones,
// utilizando una variable de entorno para mayor flexibilidad
const BASE_URL = import.meta.env.VITE_BASE_URL + "preparacion";

// Clase PreparacionService que contiene métodos para interactuar con la API de preparaciones
class PreparacionService {
  // Método para obtener todas las preparaciones registradas
  getPreparaciones() {
    return axios.get(BASE_URL);
  }

  // Método para obtener el proceso de preparación específico de un producto por su ID
  getProcesoPreparacion(idProducto) {
    return axios.get(`${BASE_URL}/getProcesoPreparacion/${idProducto}`);
  }

  // Método para obtener el proceso de preparación específico de un combo por su ID
  getProcesoCombo(idCombo) {
    return axios.get(`${BASE_URL}/getProcesoCombo/${idCombo}`);
  }
}

//Se exporta la instancia
export default new PreparacionService();
