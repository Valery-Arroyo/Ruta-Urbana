import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "preparacion";

class PreparacionService {
  getPreparaciones() {
    return axios.get(BASE_URL);
  }

  getProcesoPreparacion(idProducto) {
    return axios.get(`${BASE_URL}/getProcesoPreparacion/${idProducto}`);
  }

  getProcesoCombo(idCombo) {
    return axios.get(`${BASE_URL}/getProcesoCombo/${idCombo}`);
  }

  // MODIFICADO: Se añade el manejo de async/await para capturar errores
  async createPreparacion(data) {
    try {
      return await axios.post(`${BASE_URL}/create`, data);
    } catch (error) {
      throw error; // Propaga el error para que el componente lo capture
    }
  }

  async updatePreparacion(id, data) {
    try {
      return await axios.put(`${BASE_URL}/update/${id}`, data);
    } catch (error) {
      throw error;
    }
  }

  async deletePreparacion(id) {
    try {
      return await axios.delete(`${BASE_URL}/delete/${id}`);
    } catch (error) {
      throw error;
    }
  }
}

export default new PreparacionService();