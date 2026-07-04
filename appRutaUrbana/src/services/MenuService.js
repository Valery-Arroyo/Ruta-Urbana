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
  // Método para crear un menú
  createMenu(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  // Método para actualizar un menú
  updateMenu(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  // Método para eliminar un menú
  deleteMenu(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }


  // Método para crear un menú
  createMenu(data) {
    // Si la ruta en el router es /menu/create
    return axios.post(`${BASE_URL}/create`, data);
  }

  // Método para actualizar un menú
  updateMenu(id, data) {
    // Asegúrate de que tu backend tenga definida la ruta /menu/update/{id}
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  // Método para eliminar un menú
  deleteMenu(id) {
    // Asegúrate de que tu backend tenga definida la ruta /menu/delete/{id}
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }



}

export default new MenuService();
