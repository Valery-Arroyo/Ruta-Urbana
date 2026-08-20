import axios from "axios";

const API_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:81/apirutaurbana/";
const BASE_URL = `${API_URL}pedido`;

class PedidoService {
  getMetodosPago() {
    return axios.get(`${BASE_URL}/metodosPago`);
  }

  getMetodosEntrega() {
    return axios.get(`${BASE_URL}/metodosEntrega`);
  }

  getEstados() {
    return axios.get(`${BASE_URL}/estados`);
  }

  /*
   * Tipo de cambio USD -> CRC. Se le pide a NUESTRO backend (no al
   * servicio externo directamente), porque ese servicio externo no
   * permite llamadas desde el navegador (CORS). El backend sí puede
   * llamarlo sin problema, ya que esa restricción solo aplica a
   * peticiones hechas desde un navegador.
   */
  getTipoCambio() {
    return axios.get(`${BASE_URL}/tipoCambio`);
  }

  /* Historial del cliente autenticado (el backend valida quién es por el token) */
  getHistorialCliente() {
    return axios.get(`${BASE_URL}/historialCliente`);
  }

  /*
   * Historial completo para encargados/administrador. El enrutador del
   * backend solo admite filtros como segmentos de la URL, por eso se
   * envía el texto "todos" cuando el usuario no eligió un filtro.
   */
  getHistorialTodos(fecha, estado) {
    const fechaFiltro = fecha || "todos";
    const estadoFiltro = estado || "todos";

    return axios.get(
      `${BASE_URL}/historialTodos/${fechaFiltro}/${estadoFiltro}`,
    );
  }

  getDetalle(idPedido) {
    return axios.get(`${BASE_URL}/detalle/${idPedido}`);
  }

  create(data) {
    return axios.post(`${BASE_URL}/create`, data);
  }

  /* Cambia el estado general del pedido (solo Administrador/Encargado) */
  cambiarEstado(idPedido, idEstado) {
    return axios.put(`${BASE_URL}/update/${idPedido}`, { IdEstado: idEstado });
  }

  /* Líneas de pedido pendientes, para la pantalla de Estaciones */
  getEstaciones() {
    return axios.get(`${BASE_URL}/estaciones`);
  }

  /* Marca una línea del pedido como completada (o pendiente de nuevo) */
  cambiarEstadoLinea(idDetalle, completado) {
    return axios.post(`${BASE_URL}/cambiarEstadoLinea`, {
      IdDetalle: idDetalle,
      Completado: completado,
    });
  }

  getDashboard() {
    return axios.get(`${BASE_URL}/dashboard`);
  }
}

export default new PedidoService();
