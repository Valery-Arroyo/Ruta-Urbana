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

  // Función que crea una nueva categoría que recibe cómo parametro
  createCategoria(categoria) {
    return axios.post(`${BASE_URL}/create`, categoria);
  }

  /* Función que actualiza un código identificado por su ID y le mete la categoria modificada */
  updateCategoria(id, categoria) {
    return axios.put(`${BASE_URL}/update/${id}`, categoria);
  }

  /* Función que elimina una categoria usando su ID */
  deleteCategoria(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new ComboService();
