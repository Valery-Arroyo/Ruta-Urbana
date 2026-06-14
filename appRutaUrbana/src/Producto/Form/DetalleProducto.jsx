import axios from "axios";

const BASE_URL = "http://localhost:81/apirutaurbana/producto";

class ProductoService {

  getProductos() {
    return axios.get(BASE_URL);
  }

  getProductoById(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }
}

export default new ProductoService();