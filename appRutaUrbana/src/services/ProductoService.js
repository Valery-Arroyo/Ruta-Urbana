import axios from "axios";

// Ajusta la URL base directamente si la variable de entorno falla
const API_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:81/apirutaurbana/";
const BASE_URL = `${API_URL}producto`;

class ProductoService {
  getProductos() {
    return axios.get(BASE_URL);
  }

  getProducto(id) {
    return axios.get(`${BASE_URL}/${id}`);
  }

  getProductoDelDia() {
    return axios.get(`${BASE_URL}/productoDelDia`);
  }

  get(idProducto) {
    return axios.get(`${BASE_URL}/getIngredientes/${idProducto}`);
  }

  getCategorias() {
    return axios.get(`${API_URL}categoria/all`);
  }

  create(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  // Subir la imagen de un producto y obtener la ruta guardada en el servidor
  uploadImagen(archivo) {
    const formData = new FormData();
    formData.append("imagen", archivo);

    // No se fija el Content-Type manualmente: el navegador debe generar
    // el boundary del multipart/form-data automáticamente.
    return axios.post(`${BASE_URL}/subirImagen`, formData);
  }

  update(id, data) {
    return axios.put(`${BASE_URL}/update/${id}`, data);
  }

  delete(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  }
}

export default new ProductoService();
