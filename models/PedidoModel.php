<?php
class PedidoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Catálogos usados por el formulario de registro de pedido */
    public function metodosPago()
    {
        try {
            $sql = "SELECT IdMetodoPago, Nombre FROM MetodoPago";
            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function metodosEntrega()
    {
        try {
            $sql = "SELECT IdMetodoEntrega, Descripcion FROM MetodoEntrega";
            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function estados()
    {
        try {
            $sql = "SELECT IdEstado, Nombre, Orden FROM EstadoPedido ORDER BY Orden";
            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Historial de pedidos de un cliente, ordenado por fecha (el más reciente primero) */
    public function historialCliente($idUsuario)
    {
        try {
            $idUsuario = intval($idUsuario);

            $sql = $this->sqlBaseHistorial() . " WHERE p.IdCliente = $idUsuario ORDER BY p.FechaPedido DESC";

            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*
     * Historial de todos los pedidos, para encargados y administrador,
     * con filtro opcional por fecha y por estado. El enrutador de este
     * proyecto pasa los filtros como segmentos de la URL, por lo que el
     * frontend envía el texto "todos" cuando un filtro no aplica.
     */
    public function historialTodos($fecha = null, $estado = null)
    {
        try {
            $sql = $this->sqlBaseHistorial() . " WHERE 1 = 1";

            if (!empty($fecha) && $fecha !== 'todos') {
                $fecha = addslashes($fecha);
                $sql .= " AND DATE(p.FechaPedido) = '$fecha'";
            }

            if (!empty($estado) && $estado !== 'todos') {
                $idEstado = intval($estado);
                $sql .= " AND p.IdEstado = $idEstado";
            }

            $sql .= " ORDER BY p.FechaPedido DESC";

            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    private function sqlBaseHistorial()
    {
        return "SELECT
                    p.IdPedido,
                    p.CodigoOrden,
                    p.FechaPedido,
                    p.Total,
                    p.IdEstado,
                    est.Nombre AS NombreEstado,
                    cli.NombreCompleto AS NombreCliente,
                    emp.NombreCompleto AS NombreEmpleado,
                    me.Descripcion AS NombreMetodoEntrega
                FROM Pedido p
                INNER JOIN EstadoPedido est ON p.IdEstado = est.IdEstado
                INNER JOIN MetodoEntrega me ON p.IdMetodoEntrega = me.IdMetodoEntrega
                LEFT JOIN Usuario cli ON p.IdCliente = cli.IdUsuario
                LEFT JOIN Usuario emp ON p.IdEmpleado = emp.IdUsuario";
    }

    /* Detalle completo de un pedido, en formato de factura (encabezado + líneas) */
    public function detalle($idPedido)
    {
        try {
            $idPedido = intval($idPedido);

            $sqlEncabezado = "SELECT
                        p.IdPedido,
                        p.CodigoOrden,
                        p.FechaPedido,
                        p.OrigenPedido,
                        p.Subtotal,
                        p.Impuesto,
                        p.CostoEnvio,
                        p.Total,
                        p.DireccionEntrega,
                        p.IdEstado,
                        est.Nombre AS NombreEstado,
                        me.Descripcion AS NombreMetodoEntrega,
                        cli.NombreCompleto AS NombreCliente,
                        cli.Correo AS CorreoCliente,
                        emp.NombreCompleto AS NombreEmpleado,
                        pg.TipoPago,
                        pg.MontoPagado,
                        pg.Vuelto,
                        mp.Nombre AS NombreMetodoPago
                    FROM Pedido p
                    INNER JOIN EstadoPedido est ON p.IdEstado = est.IdEstado
                    INNER JOIN MetodoEntrega me ON p.IdMetodoEntrega = me.IdMetodoEntrega
                    LEFT JOIN Usuario cli ON p.IdCliente = cli.IdUsuario
                    LEFT JOIN Usuario emp ON p.IdEmpleado = emp.IdUsuario
                    LEFT JOIN Pago pg ON pg.IdPedido = p.IdPedido
                    LEFT JOIN MetodoPago mp ON pg.IdMetodoPago = mp.IdMetodoPago
                    WHERE p.IdPedido = $idPedido";

            $encabezado = $this->enlace->executeSQL($sqlEncabezado, "asoc");

            $sqlDetalle = "SELECT
                        d.IdDetalle,
                        d.Cantidad,
                        d.PrecioUnitario,
                        d.Subtotal,
                        d.Impuesto,
                        d.Observaciones,
                        COALESCE(p.Nombre, c.Nombre) AS NombreItem
                    FROM DetallePedido d
                    LEFT JOIN Producto p ON d.IdProducto = p.IdProducto
                    LEFT JOIN Combo c ON d.IdCombo = c.IdCombo
                    WHERE d.IdPedido = $idPedido";

            $detalle = $this->enlace->executeSQL($sqlDetalle, "asoc");

            if (empty($encabezado)) {
                return null;
            }

            return [
                'encabezado' => $encabezado[0],
                'detalle' => $detalle ?: [],
            ];
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*
     * Registra un pedido completo: encabezado, líneas de detalle, el
     * pago simulado y el historial de estados. No se usa una
     * transacción de base de datos porque MySqlConnect abre y cierra
     * la conexión en cada sentencia (igual que en ComboModel::create);
     * se mantiene ese mismo estilo para el resto del proyecto.
     */
    public function create($data, $idUsuarioToken, $nombreRolToken)
    {
        try {
            $origenPedido = $nombreRolToken === 'Cliente' ? 'cliente_web' : 'empleado';

            $idCliente = intval($data['IdCliente']);
            $idEmpleado = ($nombreRolToken === 'Cliente') ? null : intval($idUsuarioToken);
            $idMetodoEntrega = intval($data['IdMetodoEntrega']);
            $direccionEntrega = !empty($data['DireccionEntrega']) ? addslashes($data['DireccionEntrega']) : null;

            $subtotal = floatval($data['Subtotal']);
            $impuesto = floatval($data['Impuesto']);
            $costoEnvio = floatval($data['CostoEnvio'] ?? 0);
            $total = floatval($data['Total']);

            $detalles = is_array($data['Detalles'] ?? null) ? $data['Detalles'] : [];

            if (empty($detalles)) {
                throw new Exception('El pedido debe tener al menos una línea de detalle');
            }

            // Insertar el encabezado del pedido en estado "Pendiente de pago" (IdEstado = 1)
            $codigoTemporal = 'PED-TMP-' . time();

            $sqlPedido = "INSERT INTO Pedido
                            (CodigoOrden, FechaPedido, OrigenPedido, Subtotal, Impuesto, CostoEnvio, Total, DireccionEntrega, IdEstado, IdCliente, IdEmpleado, IdMetodoEntrega)
                          VALUES
                            ('$codigoTemporal', NOW(), '$origenPedido', $subtotal, $impuesto, $costoEnvio, $total,
                             " . ($direccionEntrega ? "'$direccionEntrega'" : "NULL") . ",
                             1, $idCliente, " . ($idEmpleado ? $idEmpleado : "NULL") . ", $idMetodoEntrega)";

            $idPedido = $this->enlace->executeSQL_DML_last($sqlPedido);

            if (!$idPedido) {
                throw new Exception('No se pudo registrar el pedido');
            }

            // Ahora que existe el Id, se arma el código de orden definitivo
            $codigoOrden = 'PED-' . str_pad($idPedido, 6, '0', STR_PAD_LEFT);
            $this->enlace->executeSQL_DML("UPDATE Pedido SET CodigoOrden = '$codigoOrden' WHERE IdPedido = $idPedido");

            // Insertar cada línea de detalle
            foreach ($detalles as $linea) {
                $cantidad = intval($linea['Cantidad']);
                $precioUnitario = floatval($linea['PrecioUnitario']);
                $subtotalLinea = floatval($linea['Subtotal']);
                $impuestoLinea = floatval($linea['Impuesto']);
                $observaciones = !empty($linea['Observaciones']) ? addslashes($linea['Observaciones']) : null;
                $idProducto = !empty($linea['IdProducto']) ? intval($linea['IdProducto']) : null;
                $idCombo = !empty($linea['IdCombo']) ? intval($linea['IdCombo']) : null;

                $sqlDetalle = "INSERT INTO DetallePedido
                                (Cantidad, PrecioUnitario, Subtotal, Impuesto, Observaciones, IdPedido, IdProducto, IdCombo)
                               VALUES
                                ($cantidad, $precioUnitario, $subtotalLinea, $impuestoLinea,
                                 " . ($observaciones ? "'$observaciones'" : "NULL") . ",
                                 $idPedido,
                                 " . ($idProducto ? $idProducto : "NULL") . ",
                                 " . ($idCombo ? $idCombo : "NULL") . ")";

                $this->enlace->executeSQL_DML($sqlDetalle);
            }

            // Historial: se crea el pedido
            $this->registrarHistorial($idPedido, 1, $idUsuarioToken, 'Pedido creado');

            // Simulación de pago: si viene información de pago, se registra
            //    y el pedido pasa automáticamente a "Aceptada" (IdEstado = 2)
            if (!empty($data['Pago'])) {
                $pago = $data['Pago'];

                $tipoPago = addslashes($pago['TipoPago']);
                $idMetodoPago = intval($pago['IdMetodoPago']);
                $montoPagado = floatval($pago['MontoPagado']);
                $vuelto = isset($pago['Vuelto']) ? floatval($pago['Vuelto']) : null;
                $ultimosDigitos = !empty($pago['UltimosDigitos']) ? addslashes($pago['UltimosDigitos']) : null;

                $sqlPago = "INSERT INTO Pago
                                (MontoPagado, Vuelto, TipoPago, UltimosDigitos, FechaPago, IdPedido, IdMetodoPago)
                            VALUES
                                ($montoPagado, " . ($vuelto !== null ? $vuelto : "NULL") . ", '$tipoPago',
                                 " . ($ultimosDigitos ? "'$ultimosDigitos'" : "NULL") . ",
                                 NOW(), $idPedido, $idMetodoPago)";

                $this->enlace->executeSQL_DML($sqlPago);

                $this->enlace->executeSQL_DML("UPDATE Pedido SET IdEstado = 2 WHERE IdPedido = $idPedido");

                $this->registrarHistorial($idPedido, 2, $idUsuarioToken, 'Pago recibido, pedido aceptado');
            }

            return $idPedido;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    private function registrarHistorial($idPedido, $idEstado, $idUsuario, $observacion)
    {
        $observacion = addslashes($observacion);
        $idUsuario = $idUsuario ? intval($idUsuario) : "NULL";

        $sql = "INSERT INTO HistorialEstadoPedido (IdPedido, IdEstado, FechaHora, IdUsuario, Observacion)
                VALUES ($idPedido, $idEstado, NOW(), $idUsuario, '$observacion')";

        $this->enlace->executeSQL_DML($sql);
    }
}
