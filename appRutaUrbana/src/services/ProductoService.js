import axios from "axios";

// Se define la URL base para las solicitudes relacionadas con productos, 
// utilizando una variable de entorno para mayor flexibilidad
const BASE_URL = import.meta.env.VITE_BASE_URL + "producto";

// Clase ProductoService que contiene métodos para interactuar con la API de productos
class ProductoService {
  getProductos() {
    return axios.get(BASE_URL); // Usamos la constante definida arriba
  }

  // Método para obtener un producto específico por su ID
  getProducto(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

}

// Se exporta la instancia
export default new ProductoService();
