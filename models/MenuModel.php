<?php
class MenuModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar menús
     * Ordenado por el más reciente (descendente)
     */
    public function all()
    {
        try {
            $sql = "SELECT 
                    m.IdMenu,
                    m.Nombre,
                    m.EstaActivo,
                    m.HoraInicio,
                    m.HoraFin,
                    m.GROUP_CONCAT(DISTINCT md.DiaSemana ORDER BY md.DiaSemana SEPARATOR ', ') AS DiasDisponibles,
                    MAX(md.FechaInicio) AS FechaMax
                FROM Menu m
                LEFT JOIN MenuDisponibilidad md ON m.IdMenu = md.IdMenu
                GROUP BY m.IdMenu, m.Nombre, m.EstaActivo, m.HoraInicio, m.HoraFin
                -- Aquí está la clave: ordenamos por la fecha más reciente encontrada en md
                ORDER BY 
                    m.EstaActivo DESC, 
                    COALESCE(MAX(md.FechaInicio), '1900-01-01') DESC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener menús por categoría
     */
    public function getMenuByCategoria($IdCategoria)
    {
        try {
            $sql = "SELECT * FROM Menu 
                    WHERE IdCategoria = ? 
                    AND EstaActivo = 1";

            return $this->enlace->ExecuteSQL($sql, [(int)$IdCategoria]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Detalle de producto o combo
     */
    public function getItemDetalle($id, $esCombo = true)
    {
        try {
            $idSeguro = (int)$id;

            if ($esCombo) {
                $sql = "SELECT 
                            c.Nombre,
                            c.Descripcion,
                            p.Nombre AS Componente,
                            cp.Cantidad
                        FROM Combo c
                        INNER JOIN ComboProducto cp ON c.IdCombo = cp.IdCombo
                        INNER JOIN Producto p ON cp.IdProducto = p.IdProducto
                        WHERE c.IdCombo = ?";
            } else {
                $sql = "SELECT 
                            Nombre,
                            Descripcion,
                            Precio 
                        FROM Producto 
                        WHERE IdProducto = ?";
            }

            return $this->enlace->ExecuteSQL($sql, [$idSeguro]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Ítems de un menú con imágenes
     */
    public function getMenuItemsConImagen($idMenu)
    {
        try {
            $id = (int)$idMenu;

            $sql = "SELECT 
                        IFNULL(p.Nombre, cb.Nombre) AS NombreItem,
                        IFNULL(p.Descripcion, cb.Descripcion) AS Descripcion,
                        IFNULL(p.Precio, cb.PrecioEspecial) AS Precio,
                        c.Nombre AS Categoria,
                        pi.Imagen AS ImagenProducto,
                        cb.RutaImagen AS ImagenCombo
                    FROM MenuItem mi
                    LEFT JOIN Producto p 
                        ON mi.IdProducto = p.IdProducto
                    LEFT JOIN ProductoImagen pi 
                        ON p.IdProducto = pi.IdProducto 
                        AND pi.EsPrincipal = 1
                    LEFT JOIN Combo cb 
                        ON mi.IdCombo = cb.IdCombo
                    LEFT JOIN Categoria c 
                        ON (p.IdCategoria = c.IdCategoria 
                        OR cb.IdCategoria = c.IdCategoria)
                    WHERE mi.IdMenu = $id";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Crear Menú (Mantenimiento Completo)
     */
    public function create($data)
    {
        try {
            $nombre = addslashes($data['Nombre']);
            $horaInicio = addslashes($data['HoraInicio']);
            $horaFin = addslashes($data['HoraFin']);
            $estaActivo = isset($data['EstaActivo']) ? intval($data['EstaActivo']) : 1;

            // 1. Insertar el Menú principal
            $sqlMenu = "INSERT INTO Menu (Nombre, HoraInicio, HoraFin, EstaActivo) 
                        VALUES ('$nombre', '$horaInicio', '$horaFin', $estaActivo)";
            
            $idNuevoMenu = $this->enlace->executeSQL_DML_last($sqlMenu);

            if ($idNuevoMenu) {
                // 2. Insertar la disponibilidad (Días / Fechas) si vienen los datos
                if (!empty($data['Disponibilidad']) && is_array($data['Disponibilidad'])) {
                    foreach ($data['Disponibilidad'] as $disp) {
                        $fechaInicio = !empty($disp['FechaInicio']) ? "'" . addslashes($disp['FechaInicio']) . "'" : "NULL";
                        $fechaFin = !empty($disp['FechaFin']) ? "'" . addslashes($disp['FechaFin']) . "'" : "NULL";
                        $diaSemana = !empty($disp['DiaSemana']) ? "'" . addslashes($disp['DiaSemana']) . "'" : "NULL";

                        $sqlDisp = "INSERT INTO MenuDisponibilidad (IdMenu, FechaInicio, FechaFin, DiaSemana) 
                                    VALUES ($idNuevoMenu, $fechaInicio, $fechaFin, $diaSemana)";
                        $this->enlace->executeSQL_DML($sqlDisp);
                    }
                }

                // 3. Insertar los ítems asociados (Productos o Combos)
                if (!empty($data['Items']) && is_array($data['Items'])) {
                    foreach ($data['Items'] as $item) {
                        $idProducto = !empty($item['IdProducto']) ? intval($item['IdProducto']) : "NULL";
                        $idCombo = !empty($item['IdCombo']) ? intval($item['IdCombo']) : "NULL";

                        $sqlItem = "INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) 
                                    VALUES ($idNuevoMenu, $idProducto, $idCombo)";
                        $this->enlace->executeSQL_DML($sqlItem);
                    }
                }
            }

            return $idNuevoMenu;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Actualizar Menú (Mantenimiento Completo)
     */
    public function update($id, $data)
    {
        try {
            $idMenu = intval($id);
            $nombre = addslashes($data['Nombre']);
            $horaInicio = addslashes($data['HoraInicio']);
            $horaFin = addslashes($data['HoraFin']);
            $estaActivo = isset($data['EstaActivo']) ? intval($data['EstaActivo']) : 1;

            // 1. Actualizar los datos del Menú principal
            $sqlMenu = "UPDATE Menu SET 
                            Nombre = '$nombre', 
                            HoraInicio = '$horaInicio', 
                            HoraFin = '$horaFin', 
                            EstaActivo = $estaActivo 
                        WHERE IdMenu = $idMenu";
            
            $resultado = $this->enlace->executeSQL_DML($sqlMenu);

            // 2. Sincronizar Disponibilidad (Eliminar anteriores y registrar nuevos)
            if (isset($data['Disponibilidad']) && is_array($data['Disponibilidad'])) {
                $sqlDeleteDisp = "DELETE FROM MenuDisponibilidad WHERE IdMenu = $idMenu";
                $this->enlace->executeSQL_DML($sqlDeleteDisp);

                foreach ($data['Disponibilidad'] as $disp) {
                    $fechaInicio = !empty($disp['FechaInicio']) ? "'" . addslashes($disp['FechaInicio']) . "'" : "NULL";
                    $fechaFin = !empty($disp['FechaFin']) ? "'" . addslashes($disp['FechaFin']) . "'" : "NULL";
                    $diaSemana = !empty($disp['DiaSemana']) ? "'" . addslashes($disp['DiaSemana']) . "'" : "NULL";

                    $sqlDisp = "INSERT INTO MenuDisponibilidad (IdMenu, FechaInicio, FechaFin, DiaSemana) 
                                VALUES ($idMenu, $fechaInicio, $fechaFin, $diaSemana)";
                    $this->enlace->executeSQL_DML($sqlDisp);
                }
            }

            // 3. Sincronizar Items del Menú (Eliminar anteriores y registrar nuevos)
            if (isset($data['Items']) && is_array($data['Items'])) {
                $sqlDeleteItems = "DELETE FROM MenuItem WHERE IdMenu = $idMenu";
                $this->enlace->executeSQL_DML($sqlDeleteItems);

                foreach ($data['Items'] as $item) {
                    $idProducto = !empty($item['IdProducto']) ? intval($item['IdProducto']) : "NULL";
                    $idCombo = !empty($item['IdCombo']) ? intval($item['IdCombo']) : "NULL";

                    $sqlItem = "INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) 
                                VALUES ($idMenu, $idProducto, $idCombo)";
                    $this->enlace->executeSQL_DML($sqlItem);
                }
            }

            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Borrado Lógico del Menú (Inhabilitar)
     */
    public function delete($id)
    {
        try {
            $idMenu = intval($id);
            $sql = "UPDATE Menu SET EstaActivo = 0 WHERE IdMenu = $idMenu";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}