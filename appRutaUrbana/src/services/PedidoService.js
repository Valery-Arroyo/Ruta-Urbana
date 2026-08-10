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
}

export default new PedidoService();
