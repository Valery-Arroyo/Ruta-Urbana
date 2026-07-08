import axios from "axios";

// Ajusta la URL base directamente si la variable de entorno falla
const API_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:81/apirutaurbana/";
const BASE_URL = `${API_URL}ingrediente`;

class IngredienteService {
  /* Obtener todos los ingredientes */
  getIngredientes() {
    return axios.get(BASE_URL);
  }

  /* Obtener un ingrediente por ID */
  get(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  /* Crear ingrediente */
  create(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  /* Actualizar ingrediente */
  update(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  /* Eliminar ingrediente */
  delete(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new IngredienteService();
