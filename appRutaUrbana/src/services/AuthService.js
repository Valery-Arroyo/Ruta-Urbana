import axios from "axios";

const API_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:81/apirutaurbana/";
const BASE_URL = `${API_URL}usuario`;

class AuthService {
  login(correo, contrasena) {
    return axios.post(`${BASE_URL}/login`, {
      Correo: correo,
      Contrasena: contrasena,
    });
  }

  // Lista de clientes activos, usada por el encargado al registrar un pedido
  getClientes() {
    return axios.get(`${BASE_URL}/clientes`);
  }
}

export default new AuthService();
