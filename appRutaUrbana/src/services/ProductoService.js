import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL + "producto";

class ProductoService {
  getProductos() {
    const BASE_URL = import.meta.env.VITE_BASE_URL + "producto";
console.log("BASE_URL:", BASE_URL);

    return axios.get(BASE_URL);
  }
  getProducto(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }
  createProducto(producto) {
    return axios.post(`${BASE_URL}/create`, producto);
  }
  updateProducto(id, producto) {
    return axios.put(`${BASE_URL}/update/${id}`, producto);
  }
  deleteProducto(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new ProductoService();
