import axios from "axios";

const API_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:81/apirutaurbana/";
const BASE_URL = `${API_URL}usuario`;

class UsuarioService {
  getUsuarios() {
    return axios.get(BASE_URL);
  }

  getUsuario(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  getRoles() {
    return axios.get(`${BASE_URL}/roles`);
  }

  create(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  update(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  delete(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new UsuarioService();
