import axios from "axios";

// Definimos la URL base una sola vez
const BASE_URL = import.meta.env.VITE_BASE_URL + "producto";

class ProductoService {
  getProductos() {
    return axios.get(BASE_URL); // Usamos la constante definida arriba
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

// Exportamos la instancia
export default new ProductoService();
