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

    // Historial completo, solo para encargados y administrador
    public function historialTodos($fecha = null, $estado = null)
    {
        try {
            AuthMiddleware::verificar(['Administrador', 'Encargado']);

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
            if ($tokenData->NombreRol === 'Cliente' &&
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
            // es él mismo: no se confía en lo que venga del frontend.
            if ($tokenData->NombreRol === 'Cliente') {
                $data['IdCliente'] = $tokenData->IdUsuario;
            }

            $idPedido = $pedidoModel->create($data, $tokenData->IdUsuario, $tokenData->NombreRol);

            $response->toJSON(['IdPedido' => $idPedido]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
