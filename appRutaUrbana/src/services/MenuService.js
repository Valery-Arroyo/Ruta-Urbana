import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "menu";

class MenuService {
  getMenus() {
    return axios.get(BASE_URL).catch((error) => {
      console.error("Error al obtener los menús:", error);
      throw error;
    });
  }

  // Llama a /menu/disponible que ejecuta el método 'disponible()' del controlador
  disponible() {
    return axios.get(`${BASE_URL}/disponible`).catch((error) => {
      console.error("Error al obtener el menú disponible:", error);
      throw error;
    });
  }

  // Llama a /menu/detalle/{id} que ejecuta el método 'detalle($id)' del controlador
  getMenuDetalle(id) {
    return axios.get(`${BASE_URL}/detalle/${id}`).catch((error) => {
      console.error(`Error al obtener el detalle del menú ${id}:`, error);
      throw error;
    });
  }
}

export default new MenuService();
