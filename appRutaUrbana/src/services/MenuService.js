import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}menu`;

class MenuService {
  /**
   * Obtener todos los menús
   */
  getMenus() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtener un menú por Id (detalle completo)
   */
  get(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  /**
   * Obtener el detalle del menú
   */
  get(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  /**
   * Menús disponibles
   */
  disponible() {
    return axios.get(`${BASE_URL}/disponible`);
  }

  /**
   * Crear menú
   */
  create(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  /**
   * Actualizar menú
   */
  update(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  /**
   * Eliminar menú
   */
  delete(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new MenuService();
