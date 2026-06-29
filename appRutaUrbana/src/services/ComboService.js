/* Herramienta que usamos ya tiene la lógica necesaria para hacer los procesos en la base de datos */
import axios from "axios";
/* Esta será la ruta necesaria */
const BASE_URL = import.meta.env.VITE_BASE_URL + "combo";

/* Clase ComboService necesaria para hacer las funciones necesarias con la información de la base de datos */
class ComboService {
  /* Función encargada de obtener los combos desde la base de datos */
  getCombos() {
    const BASE_URL = import.meta.env.VITE_BASE_URL + "combo";
    /* Esto es meramente de prueba para ver que responde a nivel de consola */
    console.log("BASE_URL:", BASE_URL);
    return axios.get(BASE_URL);
  }

  /* Función que obtiene un combo en especial por su ID */
  getCombo(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }
  
}

export default new ComboService();
