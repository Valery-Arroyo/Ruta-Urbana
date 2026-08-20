<?php
class Pedido
{
    // Catálogos para el formulario de registro de pedido
    public function metodosPago()
    {
        try {
            AuthMiddleware::verificar();

            $response = new Response();
            $pedido = new PedidoModel();

            $response->toJSON(['metodosPago' => $pedido->metodosPago() ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Tipo de cambio USD -> CRC (Web Service externo, consumido aquí en
    // el servidor y no desde el navegador, porque el servicio externo no
    // permite llamadas directas desde el navegador por política CORS).
    public function tipoCambio()
    {
        try {
            AuthMiddleware::verificar();

            $response = new Response();
            $pedido = new PedidoModel();

            $valor = $pedido->tipoCambioUsdACrc();

            if ($valor === null) {
                $response->status(502)->toJSON(['result' => 'No se pudo obtener el tipo de cambio en este momento']);
                return;
            }

            $response->toJSON(['tipoCambio' => $valor]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function metodosEntrega()
    {
        try {
            AuthMiddleware::verificar();

            $response = new Response();
            $pedido = new PedidoModel();

            $response->toJSON(['metodosEntrega' => $pedido->metodosEntrega() ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function estados()
    {
        try {
            AuthMiddleware::verificar();

            $response = new Response();
            $pedido = new PedidoModel();

            $response->toJSON(['estados' => $pedido->estados() ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Historial del cliente autenticado (ignora el Id que venga en la URL:
    // el usuario a consultar SIEMPRE es el que indica el token, nunca la interfaz)
    public function historialCliente($idUsuario = null)
    {
        try {
            $tokenData = AuthMiddleware::verificar();

            $response = new Response();
            $pedido = new PedidoModel();

            $result = $pedido->historialCliente($tokenData->IdUsuario);

            $response->toJSON(['pedidos' => $result ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Historial completo: Administrador, Encargado y Cocina (Cocina lo
    // necesita para ver los pedidos existentes, aunque nunca registra uno)
    public function historialTodos($fecha = null, $estado = null)
    {
        try {
            AuthMiddleware::verificar(['Administrador', 'Encargado', 'Cocina']);

            $response = new Response();
            $pedido = new PedidoModel();

            $result = $pedido->historialTodos($fecha, $estado);

            $response->toJSON(['pedidos' => $result ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Detalle de un pedido en formato de factura
    public function detalle($idPedido = null)
    {
        try {
            $tokenData = AuthMiddleware::verificar();

            $response = new Response();
            $pedido = new PedidoModel();

            $result = $pedido->detalle($idPedido);

            if (!$result) {
                $response->status(404)->toJSON(['result' => 'Pedido no encontrado']);
                return;
            }

            // Un cliente solo puede ver el detalle de sus propios pedidos
            // (se castean ambos lados a entero: el token trae el Id como
            // vino en el JSON del JWT y puede no coincidir el tipo exacto)
            if (
                $tokenData->NombreRol === 'Cliente' &&
                intval($result['encabezado']['IdCliente'] ?? 0) !== intval($tokenData->IdUsuario)
            ) {
                $response->status(403)->toJSON(['result' => 'No tiene acceso a este pedido']);
                return;
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Registrar un nuevo pedido (cliente o encargado/administrador)
    public function create()
    {
        try {
            $tokenData = AuthMiddleware::verificar(['Cliente', 'Encargado', 'Administrador']);

            $response = new Response();
            $pedidoModel = new PedidoModel();

            $data = json_decode(file_get_contents("php://input"), true);

            // Si quien registra es el cliente, el cliente del pedido
            if ($tokenData->NombreRol === 'Cliente') {
                $data['IdCliente'] = $tokenData->IdUsuario;
            }

            $idPedido = $pedidoModel->create($data, $tokenData->IdUsuario, $tokenData->NombreRol);

            $response->toJSON(['IdPedido' => $idPedido]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Cambiar el estado general de un pedido a mano (uso excepcional; en la
    // práctica el estado avanza solo cuando la Cocina trabaja las líneas)
    public function update($id)
    {
        try {
            $tokenData = AuthMiddleware::verificar(['Cocina']);

            $response = new Response();
            $pedidoModel = new PedidoModel();

            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data['IdEstado'])) {
                $response->status(400)->toJSON(['result' => 'Debe indicar el nuevo estado']);
                return;
            }

            $resultado = $pedidoModel->cambiarEstado($id, $data['IdEstado'], $tokenData->IdUsuario);

            $response->toJSON(['success' => $resultado ? 1 : 0]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Líneas de pedido pendientes, agrupadas por estación (pantalla de Estaciones,
    // uso exclusivo del rol Cocina)
    public function estaciones()
    {
        try {
            AuthMiddleware::verificar(['Cocina']);

            $response = new Response();
            $pedido = new PedidoModel();

            $response->toJSON(['lineas' => $pedido->estaciones() ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Marcar una línea del pedido como completada/pendiente desde la pantalla de Estaciones
    public function cambiarEstadoLinea()
    {
        try {
            $tokenData = AuthMiddleware::verificar(['Cocina']);

            $response = new Response();
            $pedidoModel = new PedidoModel();

            $data = json_decode(file_get_contents("php://input"), true);

            if (!isset($data['IdDetalle'])) {
                $response->status(400)->toJSON(['result' => 'Debe indicar la línea del pedido']);
                return;
            }

            $resultado = $pedidoModel->cambiarEstadoLinea(
                $data['IdDetalle'],
                $data['Completado'] ?? 1,
                $tokenData->IdUsuario
            );

            $response->toJSON(['success' => $resultado ? 1 : 0]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function dashboard()
    {
        try {
            AuthMiddleware::verificar(['Administrador', 'Encargado']);

            $response = new Response();
            $pedido = new PedidoModel();

            $resultado = $pedido->dashboard();

            $response->toJSON([
                'productosMasPedidos' => $resultado['productosMasPedidos'] ?? [],
                'pedidosPorEstado' => $resultado['pedidosPorEstado'] ?? []
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
