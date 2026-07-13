import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL + "preparacion";

class PreparacionService {
  getPreparaciones() { return axios.get(BASE_URL); }

  // Se envía el objeto directamente (JSON), no como URLSearchParams
  async updatePreparacion(id, data) {
    return await axios.put(`${BASE_URL}/update/${id}`, data);
  }

  async createPreparacion(data) {
    return await axios.post(`${BASE_URL}/create`, data);
  }

  async deletePreparacion(id) {
    return await axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new PreparacionService();