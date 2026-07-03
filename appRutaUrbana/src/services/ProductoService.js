import axios from "axios";

// Ajusta la URL base directamente si la variable de entorno falla
const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:81/apirutaurbana/";
const BASE_URL = `${API_URL}producto`;

class ProductoService {
  getProductos() {
    return axios.get(BASE_URL);
  }

  getProducto(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  getIngredientes(idProducto) {
    return axios.get(`${BASE_URL}/getIngredientes/${idProducto}`);
  }

  createProducto(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  updateProducto(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  deleteProducto(id) {
    // Si la ruta en tu backend es: http://localhost:81/apirutaurbana/producto/delete/{id}
    // este método es correcto, siempre que BASE_URL apunte a .../apirutaurbana/producto
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new ProductoService();