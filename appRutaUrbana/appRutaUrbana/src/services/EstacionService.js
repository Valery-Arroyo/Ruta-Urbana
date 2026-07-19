import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL + "estacion";

class EstacionService {
  getEstaciones() { return axios.get(BASE_URL); }
}

export default new EstacionService();