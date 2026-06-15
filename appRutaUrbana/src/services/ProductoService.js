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
  
}

// Exportamos la instancia
export default new ProductoService();