/* Herramienta que usamos ya tiene la lógica necesaria para hacer los procesos en la base de datos */
import axios from "axios";
/* Esta será la ruta necesaria */
const BASE_URL = import.meta.env.VITE_BASE_URL + "categoria";

/* Clase ComboService necesaria para hacer las funciones necesarias con la información de la base de datos */
class CategoriaService {
  /* Función encargada de obtener los combos desde la base de datos */
  getCategorias() {
    //Esto es meramente de prueba para ver que responde a nivel de consola
    const BASE_URL = import.meta.env.VITE_BASE_URL + "categoria";
    return axios.get(BASE_URL);
  }

  /* Función que obtiene un categoria en especial por su ID */
  getCategoria(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  // Crear una nueva categoría
  createCategoria(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  // Actualizar una categoría existente
  updateCategoria(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  // Eliminar una categoría
  deleteCategoria(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new CategoriaService();
