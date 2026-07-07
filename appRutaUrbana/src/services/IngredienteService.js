import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "ingrediente";

class IngredienteService {
  /* Obtener todos los ingredientes */
  getIngredientes() {
    return axios.get(BASE_URL);
  }

  /* Obtener un ingrediente por ID */
  getIngrediente(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  /* Crear ingrediente */
  createIngrediente(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  /* Actualizar ingrediente */
  updateIngrediente(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  /* Eliminar ingrediente */
  deleteIngrediente(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new IngredienteService();
