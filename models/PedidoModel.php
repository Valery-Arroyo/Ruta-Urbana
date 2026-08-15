<?php
class PedidoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function tipoCambioUsdACrc()
    {
        try {
            $contexto = stream_context_create(['http' => ['timeout' => 5]]);
            $respuesta = @file_get_contents('https://open.er-api.com/v6/latest/USD', false, $contexto);

            if ($respuesta === false) {
                return null;
            }

            $datos = json_decode($respuesta, true);

            return $datos['rates']['CRC'] ?? null;
        } catch (Exception $e) {
            return null;
        }
    }

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
                        p.IdCliente,
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

    public function cambiarEstado($idPedido, $idEstado, $idUsuarioToken)
    {
        try {
            $idPedido = intval($idPedido);
            $idEstado = intval($idEstado);

            $sql = "UPDATE Pedido SET IdEstado = $idEstado WHERE IdPedido = $idPedido";
            $this->enlace->executeSQL_DML($sql);

            $this->registrarHistorial($idPedido, $idEstado, $idUsuarioToken, 'Estado actualizado manualmente');

            return true;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function estaciones()
    {
        try {
            $sql = "SELECT
                        d.IdDetalle,
                        d.IdPedido,
                        p.CodigoOrden,
                        p.IdEstado,
                        est.Nombre AS NombreEstadoPedido,
                        d.Cantidad,
                        d.Completado,
                        d.Observaciones,
                        COALESCE(pr.Nombre, c.Nombre) AS NombreItem,
                        cli.NombreCompleto AS NombreCliente,
                        (
                            SELECT e.Nombre
                            FROM ProcesoPreparacion pp
                            INNER JOIN Estacion e ON pp.IdEstacion = e.IdEstacion
                            WHERE (d.IdProducto IS NOT NULL AND pp.IdProducto = d.IdProducto)
                               OR (d.IdCombo IS NOT NULL AND pp.IdCombo = d.IdCombo)
                            ORDER BY pp.OrdenPaso ASC
                            LIMIT 1
                        ) AS NombreEstacion
                    FROM DetallePedido d
                    INNER JOIN Pedido p ON d.IdPedido = p.IdPedido
                    INNER JOIN EstadoPedido est ON p.IdEstado = est.IdEstado
                    LEFT JOIN Producto pr ON d.IdProducto = pr.IdProducto
                    LEFT JOIN Combo c ON d.IdCombo = c.IdCombo
                    LEFT JOIN Usuario cli ON p.IdCliente = cli.IdUsuario
                    WHERE p.IdEstado <> 5
                    ORDER BY NombreEstacion, d.Completado ASC, p.FechaPedido";

            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }


    public function cambiarEstadoLinea($idDetalle, $completado, $idUsuarioToken)
    {
        try {
            $idDetalle = intval($idDetalle);
            $completado = intval($completado) ? 1 : 0;

            $sqlUpdate = "UPDATE DetallePedido SET Completado = $completado WHERE IdDetalle = $idDetalle";
            $this->enlace->executeSQL_DML($sqlUpdate);

            $sqlPedido = "SELECT p.IdPedido, p.IdEstado FROM DetallePedido d
                          INNER JOIN Pedido p ON d.IdPedido = p.IdPedido
                          WHERE d.IdDetalle = $idDetalle";
            $resultado = $this->enlace->executeSQL($sqlPedido, "asoc");

            if (empty($resultado)) {
                return false;
            }

            $idPedido = intval($resultado[0]['IdPedido']);
            $idEstadoActual = intval($resultado[0]['IdEstado']);

            $sqlPendientes = "SELECT COUNT(*) AS Pendientes FROM DetallePedido
                               WHERE IdPedido = $idPedido AND Completado = 0";
            $pendientes = $this->enlace->executeSQL($sqlPendientes, "asoc");
            $cantidadPendientes = intval($pendientes[0]['Pendientes'] ?? 0);

            if ($cantidadPendientes === 0 && $idEstadoActual !== 5) {
                $this->enlace->executeSQL_DML("UPDATE Pedido SET IdEstado = 5 WHERE IdPedido = $idPedido");
                $this->registrarHistorial($idPedido, 5, $idUsuarioToken, 'Todas las líneas completadas en cocina, pedido entregado');
            } elseif ($cantidadPendientes > 0 && $idEstadoActual === 5) {
                $this->enlace->executeSQL_DML("UPDATE Pedido SET IdEstado = 4 WHERE IdPedido = $idPedido");
                $this->registrarHistorial($idPedido, 4, $idUsuarioToken, 'Se reactivó una línea, pedido vuelve a procesamiento');
            }

            return true;
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
